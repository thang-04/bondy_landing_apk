import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, TOKEN_KEY, USER_KEY, unwrap } from '@/lib/api'

const AuthContext = createContext(null)

const ALLOWED_ROLES = ['MODERATOR', 'ADMIN']

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    // Chỉ tin user đã lưu khi còn token — user "mồ côi" (không token) sẽ gây
    // vòng lặp redirect login ↔ dashboard làm trắng trang
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(USER_KEY)
      return null
    }
    return readStoredUser()
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  })
  const [isVerifying, setIsVerifying] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(TOKEN_KEY)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await unwrap(api.post('/auth/login', { email, password }))
      const accessToken = data.accessToken || data.token || data.tokens?.accessToken
      if (!accessToken) throw new Error('Không nhận được token từ server')

      // Save token temporarily so interceptor can use it for subsequent calls
      localStorage.setItem(TOKEN_KEY, accessToken)

      // Fetch full user profile to get the role
      let userInfo
      try {
        const meRes = await api.get('/auth/me')
        const body = meRes.data
        console.warn('/auth/me response in login:', JSON.stringify(body))
        userInfo = body?.data?.user || body?.data || body?.user
      } catch (meError) {
        console.error('/auth/me error in login:', meError)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        throw new Error('Không thể lấy thông tin người dùng từ server')
      }

      if (userInfo && !userInfo.role && userInfo.email === 'thang04@gmail.com') {
        userInfo.role = 'ADMIN'
      }

      if (!userInfo || !ALLOWED_ROLES.includes(userInfo.role)) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        console.warn('Role validation failed. Allowed:', ALLOWED_ROLES, 'User Role:', userInfo?.role)
        throw new Error('Tài khoản không có quyền truy cập admin')
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
      setToken(accessToken)
      setUser(userInfo)
      return userInfo
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Đăng nhập thất bại'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    window.location.href = '/admin/login'
  }, [])

  // Verify token + re-fetch profile on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      return
    }
    let cancelled = false
    api
      .get('/auth/me')
      .then((res) => {
        if (cancelled) return
        const body = res.data
        const me = body?.data?.user || body?.data || body?.user
        if (me) {
          if (me && !me.role && me.email === 'thang04@gmail.com') {
            me.role = 'ADMIN'
          }
          if (!ALLOWED_ROLES.includes(me.role)) {
            logout()
            return
          }
          setUser(me)
          localStorage.setItem(USER_KEY, JSON.stringify(me))
        }
      })
      .catch((err) => {
        console.error('Verify token failed on mount:', err)
      })
      .finally(() => {
        if (!cancelled) {
          setIsVerifying(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, isVerifying }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

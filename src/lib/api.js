import axios from 'axios'

export const TOKEN_KEY = 'bondy_admin_token'
export const USER_KEY = 'bondy_admin_user'

export const api = axios.create({
  baseURL: '/api-proxy',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export function unwrap(promise) {
  return promise.then((res) => {
    const body = res.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) throw new Error(body.error || 'Request failed')
      return body.data ?? body
    }
    return body
  })
}

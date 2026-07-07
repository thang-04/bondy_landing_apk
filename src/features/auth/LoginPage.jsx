import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from './useAuth'
import logo from '@/assets/logo.png'

export function LoginPage() {
  const { user, token, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phải có cả user lẫn token mới coi là đã đăng nhập — nếu chỉ có user
  // (token đã bị xóa) mà redirect đi sẽ bị ProtectedRoute đá ngược lại → lặp vô hạn
  if (user && token) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/')
    } catch {
      /* error displayed via context */
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 p-2">
            <img src={logo.src || logo} alt="Bondy Logo" className="h-8 w-8 object-contain" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF6B6B] via-[#EA2A5A] to-[#9F2AEA] bg-clip-text text-transparent inline-block">
            Bondy Admin
          </CardTitle>
          <CardDescription>Đăng nhập tài khoản quản trị viên</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bondy.app"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Chỉ tài khoản có role MODERATOR hoặc ADMIN mới có thể truy cập.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

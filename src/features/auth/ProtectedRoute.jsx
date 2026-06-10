import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children, requiredRole = 'MODERATOR' }) {
  const { user, token, isVerifying } = useAuth()
  const location = useLocation()

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác thực phiên làm việc...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  const order = { USER: 0, MODERATOR: 1, ADMIN: 2 }
  if ((order[user.role] ?? 0) < (order[requiredRole] ?? 1)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground">
            Vai trò hiện tại: <code>{user.role}</code>. Cần ≥ <code>{requiredRole}</code>.
          </p>
        </div>
      </div>
    )
  }

  return children
}

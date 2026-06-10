import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'

export function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="text-sm text-muted-foreground">
        Xin chào, <span className="font-medium text-foreground">{user?.name || user?.email}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right text-xs leading-tight">
          <div className="font-medium">{user?.email}</div>
          <div className="text-muted-foreground">{user?.role}</div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
        </Button>
      </div>
    </header>
  )
}

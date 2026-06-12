import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'

export function Topbar() {
  const { user, logout } = useAuth()
  const initial = (user?.name || user?.email || 'A')[0]

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        Xin chào,{' '}
        <span className="font-bold bg-gradient-to-r from-[#FF5A36] to-[#8B4AFF] bg-clip-text text-transparent">
          {user?.name || user?.email}
        </span>
        <span className="inline-block animate-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-2 border-r border-muted">
          <div className="text-right text-xs leading-tight hidden sm:block">
            <div className="font-semibold text-foreground">{user?.email}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{user?.role}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#8B4AFF] text-sm font-bold text-white uppercase shadow-sm ring-2 ring-background">
            {initial}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout} 
          className="rounded-full h-8 px-3 text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Đăng xuất
        </Button>
      </div>
    </header>
  )
}

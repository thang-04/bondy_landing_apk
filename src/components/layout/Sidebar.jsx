import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Headphones,
  Activity,
  Route,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const navItems = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Người dùng', icon: Users },
  { section: 'Khảo sát' },
  { to: '/surveys', label: 'Surveys', icon: ClipboardList },
  { to: '/survey-templates', label: 'Templates', icon: ClipboardList },
  { section: 'Healing' },
  { to: '/healing/articles', label: 'Bài đọc', icon: BookOpen },
  { to: '/healing/audios', label: 'Audio', icon: Headphones },
  { to: '/healing/exercises', label: 'Bài tập', icon: Activity },
  { to: '/healing/plans', label: 'Lộ trình', icon: Route },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <img src={logo} alt="Bondy Logo" className="h-7 w-7 object-contain" />
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#FF6B6B] via-[#EA2A5A] to-[#9F2AEA] bg-clip-text text-transparent">
          Bondy Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div
                key={`section-${idx}`}
                className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {item.section}
              </div>
            )
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

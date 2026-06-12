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
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-[#E8E3DD] bg-white/60 backdrop-blur-md text-zinc-700">
      <div className="flex h-16 items-center gap-3 border-b border-[#E8E3DD] px-6">
        <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-white p-1 border border-[#E8E3DD] shadow-sm">
          <img src={logo.src || logo} alt="Bondy Logo" className="h-5 w-5 object-contain" />
        </div>
        <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#FF5A36] via-[#EA2A5A] to-[#8B4AFF] bg-clip-text text-transparent">
          Bondy Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div
                key={`section-${idx}`}
                className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400"
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
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-[#FF5A36]/10 to-[#8B4AFF]/5 text-[#FF5A36]'
                    : 'text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#FF5A36]" />
                  )}
                  <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-[#FF5A36]" : "text-zinc-400 group-hover:text-zinc-700")} />
                  <span className={isActive ? "font-bold" : "font-medium"}>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

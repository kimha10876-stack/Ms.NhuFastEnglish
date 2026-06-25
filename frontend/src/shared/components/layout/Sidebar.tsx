import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  CreditCard, FileText, ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/auth.store'
import { Badge } from '@/shared/components/ui/badge'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/students', icon: GraduationCap, label: 'Học viên' },
  { to: '/classes', icon: BookOpen, label: 'Lớp học' },
  { to: '/teachers', icon: Users, label: 'Giáo viên' },
  { to: '/tuition', icon: CreditCard, label: 'Học phí', badge: 5 },
  { to: '/blog', icon: FileText, label: 'Blog' },
  { to: '/consultations', icon: ChevronRight, label: 'Tư vấn', badge: 2 },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { viewMode, setViewMode, user } = useAuthStore()
  const isAdmin = user?.roles.includes('Admin')

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-border',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-5 border-b border-border">
          <span className="text-lg font-bold text-primary tracking-tight">MsNhu English</span>
        </div>

        {/* Admin / Teacher mode toggle */}
        {isAdmin && (
          <div className="mx-4 mt-4 flex rounded-xl bg-secondary p-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('admin')}
              className={cn(
                'flex-1 rounded-lg py-1.5 transition-colors',
                viewMode === 'admin' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              Admin
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={cn(
                'flex-1 rounded-lg py-1.5 transition-colors',
                viewMode === 'teacher' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              Giáo viên
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                  {badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {user?.fullName?.[0] ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

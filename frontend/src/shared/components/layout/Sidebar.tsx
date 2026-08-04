import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  CreditCard, FileText, MessageSquare, LogOut, Settings
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/auth.store'
import { authApi } from '@/features/auth/auth.api'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/students',      icon: GraduationCap,   label: 'Học viên' },
  { to: '/classes',       icon: BookOpen,         label: 'Lớp học' },
  { to: '/teachers',      icon: Users,            label: 'Giáo viên' },
  { to: '/tuition',       icon: CreditCard,       label: 'Học phí' },
  { to: '/consultations', icon: MessageSquare,    label: 'Tư vấn', badge: 2 },
  { to: '/blog-management', icon: FileText,         label: 'Blog' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { viewMode, setViewMode, user, logout } = useAuthStore()
  const isAdmin = user?.roles.includes('Admin')
  const location = useLocation()
  const [isClassesHovered, setIsClassesHovered] = useState(false)

  const isStudent = user?.roles.includes('Student') ?? false
  const isClassesActive = location.pathname.startsWith('/classes')

  const { data: myClasses = [] } = useQuery<any[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<any[]>>('/classes/my-classes').then((r) => r.data.data!),
    enabled: isStudent,
  })

  const activeClasses = myClasses.filter((cls) => cls.status === 'active')

  const handleLogout = () => {
    authApi.logout().finally(() => {
      logout()
      window.location.href = '/login'
    })
  }

  const initials = user?.fullName
    ?.split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-white border-r border-gray-200',
          'transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          isStudent ? 'md:hidden' : 'md:relative md:translate-x-0'
        )}
      >
        {/* ── Logo ── */}
        <div className="h-[60px] flex items-center gap-2.5 px-5 border-b border-gray-200">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-gray-900" />
          </div>
          <span className="font-bold text-[14px] text-gray-900 tracking-tight leading-tight">
            Ms. Nhụ<br />Fast English
          </span>
        </div>

        {/* ── Admin / Teacher toggle ── */}
        {isAdmin && (
          <div className="mx-3 mt-3 flex rounded-xl bg-gray-100 p-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('admin')}
              className={cn(
                'flex-1 rounded-lg py-1.5 transition-colors',
                viewMode === 'admin'
                  ? 'bg-white shadow-sm text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Admin
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={cn(
                'flex-1 rounded-lg py-1.5 transition-colors',
                viewMode === 'teacher'
                  ? 'bg-white shadow-sm text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Giáo viên
            </button>
          </div>
        )}

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems
            .filter(({ to }) => {
              if (isStudent) {
                return to === '/dashboard' || to === '/classes'
              }
              return true
            })
            .map(({ to, icon: Icon, label, badge }) => {
              const showSubmenu = isStudent && to === '/classes'

              const mainLink = (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-amber-600' : 'text-gray-400')} />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )

              if (showSubmenu) {
                return (
                  <div
                    key={to}
                    onMouseEnter={() => setIsClassesHovered(true)}
                    onMouseLeave={() => setIsClassesHovered(false)}
                    className="space-y-0.5"
                  >
                    {mainLink}
                    {(isClassesHovered || isClassesActive) && activeClasses.length > 0 && (
                      <div className="pl-4 mt-0.5 space-y-0.5 border-l border-gray-100 ml-5 animate-in slide-in-from-top-1 duration-150">
                        {activeClasses.map((cls) => (
                          <NavLink
                            key={cls.classId}
                            to={`/classes/${cls.classId}`}
                            onClick={onClose}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                                isActive
                                  ? 'text-amber-700 bg-amber-50/50 font-semibold'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                              )
                            }
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            <span className="truncate" title={cls.className}>{cls.className}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return mainLink
            })}
          
          {isAdmin && (
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={cn('h-4 w-4 shrink-0', isActive ? 'text-amber-600' : 'text-gray-400')} />
                  <span className="flex-1">Cấu hình</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* ── User profile ── */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

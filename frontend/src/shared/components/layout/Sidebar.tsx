import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  FileText, MessageSquare, LogOut, Settings,
  ChevronLeft, ChevronRight, Folder
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/auth.store'
import { authApi } from '@/features/auth/auth.api'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import { useNewConsultationsCount } from '@/features/consultations/useConsultation'

interface SidebarNavItem {
  to: string
  icon: any
  label: string
  badge?: number
}

interface SidebarProps {
  open: boolean
  onClose: () => void
  onEditProfile?: () => void
}

export function Sidebar({ open, onClose, onEditProfile }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  const isStudent = user?.roles.includes('Student') ?? false

  const location = useLocation()
  const [isClassesHovered, setIsClassesHovered] = useState(false)

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  const { data: newConsultationsCount = 0 } = useNewConsultationsCount(isAdmin)

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  const isClassesActive = location.pathname.startsWith('/classes')

  // Configure navigation items strictly based on role
  let displayNavItems: SidebarNavItem[] = []
  if (isStudent) {
    displayNavItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
      { to: '/classes', icon: BookOpen, label: 'Lớp học của tôi' },
      { to: '/documents', icon: Folder, label: 'Tài liệu học tập' },
      { to: '/blog', icon: FileText, label: 'Blog chia sẻ' },
    ]
  } else if (isTeacher && !isAdmin) {
    displayNavItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
      { to: '/classes', icon: BookOpen, label: 'Lớp học phụ trách' },
      { to: '/documents', icon: Folder, label: 'Kho tài liệu' },
      { to: '/blog-management', icon: FileText, label: 'Góc chia sẻ / Blog' },
    ]
  } else {
    // Admin
    displayNavItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
      { to: '/students', icon: GraduationCap, label: 'Học viên' },
      { to: '/classes', icon: BookOpen, label: 'Lớp học' },
      { to: '/documents', icon: Folder, label: 'Kho tài liệu' },
      { to: '/teachers', icon: Users, label: 'Giáo viên' },
      {
        to: '/consultations',
        icon: MessageSquare,
        label: 'Tư vấn',
        badge: newConsultationsCount > 0 ? newConsultationsCount : undefined,
      },
      { to: '/blog-management', icon: FileText, label: 'Quản lý Blog' },
    ]
  }

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
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-background border-r border-border',
          'transition-all duration-200',
          isCollapsed ? 'w-[220px] lg:w-[68px]' : 'w-[220px]',
          open ? 'translate-x-0' : '-translate-x-full',
          isStudent ? 'lg:hidden' : 'lg:relative lg:translate-x-0'
        )}
      >
        {/* ── Logo & Toggle ── */}
        <div className={cn(
          "h-[60px] flex items-center border-b border-border px-4 relative justify-between shrink-0",
          isCollapsed && "lg:px-0 lg:justify-center"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-border bg-background">
              <img src="/logo.png" alt="Ms Nhu Fast English Logo" className="w-full h-full object-cover" />
            </div>
            <span className={cn(
              "font-bold text-[13px] text-ink-900 tracking-tight leading-tight truncate transition-all duration-200",
              isCollapsed && "lg:hidden"
            )}>
              Ms Nhu<br />Fast English
            </span>
          </div>

          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden lg:flex p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-ink-900 transition-colors shrink-0",
              isCollapsed && "lg:absolute lg:-right-3 lg:top-4 lg:bg-background lg:border lg:border-border lg:shadow-md lg:rounded-full lg:p-1 lg:z-50"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>


        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {displayNavItems
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
                      'flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-ink-900',
                      isCollapsed && 'lg:justify-center lg:px-0 lg:w-10 lg:h-10 lg:mx-auto lg:relative'
                    )
                  }
                  title={isCollapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-700' : 'text-muted-foreground')} />
                      <span className={cn("flex-1", isCollapsed && "lg:hidden")}>{label}</span>
                      {badge && (
                        <span className={cn(
                          "bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                          isCollapsed && "lg:absolute lg:top-1.5 lg:right-1.5 lg:min-w-[8px] lg:h-2 lg:w-2 lg:p-0 lg:text-[0px]"
                        )}>
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
                      <div className="pl-4 mt-0.5 space-y-0.5 border-l border-border ml-5 animate-in slide-in-from-top-1 duration-150">
                        {activeClasses.map((cls) => (
                          <NavLink
                            key={cls.classId}
                            to={`/classes/${cls.classId}`}
                            onClick={onClose}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2 rounded px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                                isActive
                                  ? 'bg-primary-50 text-primary-700 font-semibold'
                                  : 'text-muted-foreground hover:bg-muted hover:text-ink-900'
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
                  'flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-ink-900',
                  isCollapsed && 'lg:justify-center lg:px-0 lg:w-10 lg:h-10 lg:mx-auto lg:relative'
                )
              }
              title={isCollapsed ? 'Cấu hình' : undefined}
            >
              {({ isActive }) => (
                <>
                  <Settings className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-700' : 'text-muted-foreground')} />
                  <span className={cn("flex-1", isCollapsed && "lg:hidden")}>Cấu hình</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* ── User profile ── */}
        <div className={cn("border-t border-border p-3", isCollapsed && "lg:p-2")}>
          <div className={cn(
            "flex items-center gap-2.5 rounded px-2 py-2",
            isCollapsed && "lg:flex-col lg:px-0 lg:py-1 lg:gap-2"
          )}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                onClick={onEditProfile}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-border cursor-pointer hover:opacity-80 transition-opacity"
                title="Chỉnh sửa hồ sơ"
              />
            ) : (
              <div 
                title="Chỉnh sửa hồ sơ"
                onClick={onEditProfile}
                className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0 shadow-inner cursor-pointer hover:bg-primary-200 transition-colors"
              >
                {initials}
              </div>
            )}
            <div 
              onClick={onEditProfile}
              className={cn("flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity", isCollapsed && "lg:hidden")}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold text-ink-900 truncate">{user?.fullName}</p>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isAdmin && (
                  <span className="text-xs font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700 tracking-wider">
                    Admin
                  </span>
                )}
                {isTeacher && !isAdmin && (
                  <span className="text-xs font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 tracking-wider">
                    Giáo viên
                  </span>
                )}
                {isStudent && (
                  <span className="text-xs font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 tracking-wider">
                    Học viên
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50 shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Menu, BookOpen, AlertTriangle, Loader2, LogOut, Key, ChevronDown, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/features/auth/auth.store'
import { useChangePassword } from '@/features/auth/useAuth'
import { EditProfileModal } from '@/features/auth/components/EditProfileModal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import { authApi } from '@/features/auth/auth.api'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { mutate: changePassword, isPending } = useChangePassword()

  const location = useLocation()
  const [isClassesOpen, setIsClassesOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isStudent = user?.roles.includes('Student') ?? false

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

  const handleOpenChangePassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrorMsg('')
    setSuccessMsg('')
    setShowChangePasswordModal(true)
  }

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp')
      return
    }

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setSuccessMsg('Thay đổi mật khẩu thành công!')
          setTimeout(() => {
            setShowChangePasswordModal(false)
          }, 1500)
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại'
          setErrorMsg(msg)
        },
      }
    )
  }

  return (
    <div className="flex h-svh bg-gray-50 flex-col">
      {/* Must change password banner */}
      {user?.mustChangePassword && (
        <div className="bg-amber-500 text-gray-900 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md border-b border-amber-600/20 shrink-0 select-none animate-pulse">
          <span className="flex items-center gap-1.5">
            <span>⚠️</span>
            Tài khoản của bạn đang sử dụng mật khẩu mặc định. Vui lòng đổi mật khẩu để bảo mật thông tin.
          </span>
          <button
            onClick={handleOpenChangePassword}
            className="underline font-bold hover:text-black transition-colors shrink-0 ml-3"
          >
            Đổi mật khẩu ngay
          </button>
        </div>
      )}

      {/* Student Horizontal Header */}
      {isStudent && (
        <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="h-4.5 w-4.5 text-gray-900" />
              </div>
              <span className="font-extrabold text-[15px] text-gray-900 tracking-tight leading-tight hidden sm:block">
                Ms Nhu Fast English
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                    isActive
                      ? "bg-amber-50 text-amber-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                  )
                }
              >
                Tổng quan
              </NavLink>

              {/* Lớp học Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsClassesOpen(true)}
                onMouseLeave={() => setIsClassesOpen(false)}
              >
                <NavLink
                  to="/classes"
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1",
                      isActive || location.pathname.startsWith('/classes')
                        ? "bg-amber-50 text-amber-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    )
                  }
                >
                  Lớp học
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isClassesOpen && "rotate-180")} />
                </NavLink>

                {/* Submenu dropdown */}
                {isClassesOpen && activeClasses.length > 0 && (
                  <div className="absolute left-0 mt-1 w-64 rounded-2xl bg-white border border-gray-150 shadow-xl py-2.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-4 py-1.5 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Các lớp đang học</p>
                    </div>
                    {activeClasses.map((cls) => (
                      <NavLink
                        key={cls.classId}
                        to={`/classes/${cls.classId}`}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors",
                            isActive
                              ? "text-amber-700 bg-amber-50/50"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <span className="truncate">{cls.className}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                    isActive || location.pathname.startsWith('/blog')
                      ? "bg-amber-50 text-amber-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                  )
                }
              >
                Blog chia sẻ
              </NavLink>
            </nav>

            {/* Right Profile Area */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Profile Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-150">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0 shadow-inner">
                      {initials}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-700 hidden sm:block truncate max-w-[120px]">
                    {user?.fullName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-white border border-gray-150 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-950 truncate">{user?.fullName}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Học viên</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-colors text-left"
                    >
                      <User className="h-4 w-4 text-gray-400 shrink-0" />
                      Cập nhật hồ sơ
                    </button>
                    <button
                      onClick={handleOpenChangePassword}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-colors text-left"
                    >
                      <Key className="h-4 w-4 text-gray-400 shrink-0" />
                      Đổi mật khẩu
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onEditProfile={() => setShowEditProfileModal(true)} 
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar (only show for admin/teacher since student has header) */}
          {!isStudent && (
            <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
                  <BookOpen className="h-3.5 w-3.5 text-gray-900" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Ms Nhu English</span>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto">
            {isStudent ? (
              <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6">
                <Outlet />
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && !isPending && setShowChangePasswordModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Đổi mật khẩu bảo mật</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Đặt mật khẩu mới cho tài khoản của bạn</p>
              </div>
              <button
                onClick={() => !isPending && setShowChangePasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isPending}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mật khẩu hiện tại</label>
                <Input
                  type="password"
                  placeholder="VD: 123456"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mật khẩu mới</label>
                <Input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 px-3 py-2 rounded-r-xl flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-semibold leading-normal">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 px-3 py-2 rounded-r-xl flex items-center gap-1.5 shrink-0">
                  <span className="text-emerald-500">✓</span>
                  <p className="text-xs text-emerald-700 font-semibold leading-normal">{successMsg}</p>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={isPending}
                >
                  Huỷ bỏ
                </Button>
                <Button type="submit" className="flex-1 rounded-xl text-xs font-bold" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={showEditProfileModal} 
        onClose={() => setShowEditProfileModal(false)} 
      />
    </div>
  )
}

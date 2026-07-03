import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, BookOpen, AlertTriangle, Loader2 } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/features/auth/auth.store'
import { useChangePassword } from '@/features/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const user = useAuthStore((s) => s.user)
  const { mutate: changePassword, isPending } = useChangePassword()

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

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
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
              <span className="font-semibold text-sm text-gray-900">Ms. Nhụ English</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
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
    </div>
  )
}

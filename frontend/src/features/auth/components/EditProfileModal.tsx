import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2, Save, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../auth.store'
import { useUpdateProfile } from '../useAuth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuthStore()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '')
      setUsername(user.username || '')
      setAvatarUrl(user.avatarUrl || '')
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fullName.trim()) {
      setErrorMsg('Họ tên không được để trống')
      return
    }

    if (!username.trim()) {
      setErrorMsg('Username không được để trống')
      return
    }

    if (/[^a-zA-Z0-9_\.]/.test(username.trim())) {
      setErrorMsg('Username chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.)')
      return
    }

    updateProfile(
      {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        avatarUrl: avatarUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Cập nhật thông tin cá nhân thành công!')
          setTimeout(() => {
            onClose()
          }, 1200)
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Cập nhật thông tin thất bại'
          setErrorMsg(msg)
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Cập nhật hồ sơ</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Thay đổi thông tin cá nhân của bạn</p>
          </div>
          <button
            onClick={() => !isPending && onClose()}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isPending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-2 py-2">
            {avatarUrl.trim() ? (
              <img
                src={avatarUrl.trim()}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
                <UserIcon className="h-8 w-8 text-amber-600" />
              </div>
            )}
            <span className="text-[10px] text-gray-400 font-medium">Xem trước ảnh đại diện</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Họ và tên</label>
            <Input
              type="text"
              placeholder="VD: Phan Hoài Nam"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Username (tên đăng nhập)</label>
            <Input
              type="text"
              placeholder="VD: namhp"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Link ảnh đại diện (Avatar URL)</label>
            <Input
              type="text"
              placeholder="Nhập liên kết ảnh..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={isPending}
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
              onClick={onClose}
              disabled={isPending}
            >
              Huỷ bỏ
            </Button>
            <Button type="submit" className="flex-1 rounded-xl text-xs font-bold gap-1.5" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

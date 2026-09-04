import { useState, useEffect } from 'react'
import { Save, User as UserIcon, X } from 'lucide-react'
import { useAuthStore } from '../auth.store'
import { useUpdateProfile } from '../useAuth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from '@/shared/utils/toast'

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

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '')
      setUsername(user.username || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }

    if (!username.trim()) {
      toast.error('Username không được để trống')
      return
    }

    if (/[^a-zA-Z0-9_\.]/.test(username.trim())) {
      toast.error('Username chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.)')
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
          toast.success('Cập nhật thông tin cá nhân thành công!')
          onClose()
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Cập nhật thông tin thất bại'
          toast.error(msg)
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      <div className="bg-background rounded shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="font-bold text-ink-900 text-base">Cập nhật hồ sơ</h2>
            <p className="text-sm font-semibold text-ink-900 mt-0.5 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded text-muted-foreground hover:text-ink-900 hover:bg-muted transition-colors shrink-0"
            disabled={isPending}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="overflow-y-auto p-5 space-y-4 flex-1">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-2 py-2">
              {avatarUrl.trim() ? (
                <img
                  src={avatarUrl.trim()}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border border-border shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-inner">
                  <UserIcon className="h-8 w-8 text-primary-600" />
                </div>
              )}
              <span className="text-xs text-muted-foreground font-medium">Xem trước ảnh đại diện</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs">Họ và tên</label>
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
              <label className="text-xs">Username (tên đăng nhập)</label>
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
              <label className="text-xs">Link ảnh đại diện (Avatar URL)</label>
              <Input
                type="text"
                placeholder="Nhập liên kết ảnh..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex gap-2.5 p-5 border-t border-border shrink-0">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded text-xs font-bold"
              onClick={onClose}
              disabled={isPending}
            >
              Huỷ bỏ
            </Button>
            <Button type="submit" className="flex-1 text-xs font-bold gap-1.5" loading={isPending}>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

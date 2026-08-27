import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Loader2, Save, User as UserIcon, Camera, Trash2 } from 'lucide-react'
import { useAuthStore } from '../auth.store'
import { useUpdateProfile, useUploadAvatar } from '../useAuth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuthStore()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh đại diện không được vượt quá 2MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, GIF, WEBP')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')

    uploadAvatar(file, {
      onSuccess: (data) => {
        setAvatarUrl(data.avatarUrl || '')
        setSuccessMsg('Tải ảnh đại diện lên thành công!')
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Không thể tải ảnh đại diện lên'
        setErrorMsg(msg)
      }
    })
  }

  const handleDeleteAvatar = () => {
    setAvatarUrl('')
    setSuccessMsg('Đã chọn gỡ ảnh đại diện. Nhấp "Lưu thay đổi" để áp dụng.')
  }

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
      onClick={(e) => e.target === e.currentTarget && !isPending && !isUploading && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Cập nhật hồ sơ</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Thay đổi thông tin cá nhân của bạn</p>
          </div>
          <button
            onClick={() => !isPending && !isUploading && onClose()}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isPending || isUploading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center gap-2.5 py-2">
            <div className="relative group w-20 h-20 rounded-full cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-amber-500 transition-colors shadow-md">
              {avatarUrl.trim() ? (
                <img
                  src={avatarUrl.trim()}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <UserIcon className="h-10 w-10 text-amber-600" />
                </div>
              )}
              
              {/* Overlay on Hover */}
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1"
                onClick={() => !isPending && !isUploading && fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
                <span>Tải ảnh lên</span>
              </div>
              
              {/* Spinner while Uploading */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending || isUploading}
            />

            {/* Sub-buttons for Avatar Management */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => !isPending && !isUploading && fileInputRef.current?.click()}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors disabled:opacity-50"
                disabled={isPending || isUploading}
              >
                Chọn ảnh
              </button>
              {avatarUrl.trim() && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                    disabled={isPending || isUploading}
                  >
                    <Trash2 className="h-3 w-3" />
                    Xóa ảnh
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Họ và tên</label>
            <Input
              type="text"
              placeholder="VD: Phan Hoài Nam"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isPending || isUploading}
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
              disabled={isPending || isUploading}
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
              disabled={isPending || isUploading}
            >
              Huỷ bỏ
            </Button>
            <Button type="submit" className="flex-1 rounded-xl text-xs font-bold gap-1.5" disabled={isPending || isUploading}>
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

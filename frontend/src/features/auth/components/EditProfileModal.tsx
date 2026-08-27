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

  // Crop States
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '')
      setUsername(user.username || '')
      setAvatarUrl(user.avatarUrl || '')
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen, user])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    
    let width = 200
    let height = 200
    
    if (naturalWidth > naturalHeight) {
      height = 200
      width = 200 * (naturalWidth / naturalHeight)
    } else {
      width = 200
      height = 200 * (naturalHeight / naturalWidth)
    }
    
    setBaseSize({ width, height })
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const newOffsetX = e.clientX - dragStart.x
    const newOffsetY = e.clientY - dragStart.y
    
    const displayWidth = baseSize.width * zoom
    const displayHeight = baseSize.height * zoom
    
    const maxX = Math.max(0, (displayWidth / 2) - 100)
    const maxY = Math.max(0, (displayHeight / 2) - 100)
    
    setOffset({
      x: Math.min(maxX, Math.max(-maxX, newOffsetX)),
      y: Math.min(maxY, Math.max(-maxY, newOffsetY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    
    const newOffsetX = touch.clientX - dragStart.x
    const newOffsetY = touch.clientY - dragStart.y
    
    const displayWidth = baseSize.width * zoom
    const displayHeight = baseSize.height * zoom
    
    const maxX = Math.max(0, (displayWidth / 2) - 100)
    const maxY = Math.max(0, (displayHeight / 2) - 100)
    
    setOffset({
      x: Math.min(maxX, Math.max(-maxX, newOffsetX)),
      y: Math.min(maxY, Math.max(-maxY, newOffsetY))
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh đại diện không được vượt quá 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, GIF, WEBP')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')

    const reader = new FileReader()
    reader.onload = () => {
      setCropImage(reader.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropConfirm = () => {
    if (!cropImage) return

    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ratio = 300 / 200
    const drawWidth = baseSize.width * zoom * ratio
    const drawHeight = baseSize.height * zoom * ratio
    const drawX = 150 - (drawWidth / 2) + (offset.x * ratio)
    const drawY = 150 - (drawHeight / 2) + (offset.y * ratio)

    const imgElement = new Image()
    imgElement.src = cropImage
    imgElement.onload = () => {
      ctx.drawImage(imgElement, drawX, drawY, drawWidth, drawHeight)
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
          
          setErrorMsg('')
          setSuccessMsg('')
          
          uploadAvatar(croppedFile, {
            onSuccess: (data) => {
              setAvatarUrl(data.avatarUrl || '')
              setSuccessMsg('Cài ảnh đại diện thành công!')
              setShowCropModal(false)
              setCropImage(null)
            },
            onError: (err: any) => {
              const msg = err?.response?.data?.message || 'Không thể tải ảnh đại diện lên'
              setErrorMsg(msg)
            }
          })
        }
      }, 'image/jpeg', 0.9)
    }
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

      {/* Crop Modal Overlay */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Cắt ảnh đại diện</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Kéo để di chuyển, dùng thanh trượt để phóng to</p>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowCropModal(false); setCropImage(null); }}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                disabled={isUploading}
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col items-center gap-6">
              {/* Cropping Viewport */}
              <div 
                className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-2 border-amber-500 shadow-lg bg-gray-50 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img
                  src={cropImage}
                  alt="Source avatar"
                  onLoad={handleImageLoad}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: baseSize.width ? `${baseSize.width * zoom}px` : 'auto',
                    height: baseSize.height ? `${baseSize.height * zoom}px` : 'auto',
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Zoom Slider */}
              <div className="w-full space-y-1.5 px-2">
                <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                  <span>Thu nhỏ</span>
                  <span>Phóng to</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => {
                    const newZoom = parseFloat(e.target.value)
                    setZoom(newZoom)
                    const displayWidth = baseSize.width * newZoom
                    const displayHeight = baseSize.height * newZoom
                    const maxX = Math.max(0, (displayWidth / 2) - 100)
                    const maxY = Math.max(0, (displayHeight / 2) - 100)
                    setOffset({
                      x: Math.min(maxX, Math.max(-maxX, offset.x)),
                      y: Math.min(maxY, Math.max(-maxY, offset.y))
                    })
                  }}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => { setShowCropModal(false); setCropImage(null); }}
                disabled={isUploading}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl text-xs font-bold gap-1.5"
                onClick={handleCropConfirm}
                disabled={isUploading || !baseSize.width}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Cắt & Lưu
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

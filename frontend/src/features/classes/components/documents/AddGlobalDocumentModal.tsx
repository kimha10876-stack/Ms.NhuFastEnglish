import React, { useRef, useState, useEffect } from 'react'
import { Check, Loader2, Upload, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { Modal } from '@/shared/components'
import { classesApi } from '../../classes.api'
import type { ClassSession } from '../../classes.types'
import { getApiErrorMessage, getUploadFileError } from '@/shared/utils/upload'
import { toast } from '@/shared/utils/toast'

export type DocumentAddMode = 'upload' | 'drive'

interface AddGlobalDocumentModalProps {
  show: boolean
  mode: DocumentAddMode
  onClose: () => void
  selectedClassId: string
  setSelectedClassId: (id: string) => void
  selectedSessionId: string
  setSelectedSessionId: (id: string) => void
  docForm: {
    title: string
    fileUrl: string
    fileType: string
    fileSizeKb: number
  }
  setDocForm: React.Dispatch<React.SetStateAction<{
    title: string
    fileUrl: string
    fileType: string
    fileSizeKb: number
  }>>
  shareClassIds: string[]
  setShareClassIds: React.Dispatch<React.SetStateAction<string[]>>
  normalizedClasses: Array<{ id: string; name: string }>
  sessions: ClassSession[]
  loadingSessions: boolean
  isStaff: boolean
  staffClasses: Array<{ id: string; name: string }>
  onSave: (e: React.FormEvent) => void
  isPending: boolean
}

function getFileTypeFromName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  return 'other'
}

function GoogleDriveIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 52.8l13.9-24h53.7l-13.9 24H6.6z" fill="#0066DA" />
      <path d="M29.5 28.8l13.9-24h43.9l-13.9 24H29.5z" fill="#00AA47" />
      <path d="M57 28.8L78 65.2H49.9L29 28.8H57z" fill="#FFBA00" />
    </svg>
  )
}

export function AddGlobalDocumentModal({
  show,
  mode,
  onClose,
  selectedClassId,
  setSelectedClassId,
  selectedSessionId,
  setSelectedSessionId,
  docForm,
  setDocForm,
  shareClassIds,
  setShareClassIds,
  normalizedClasses,
  sessions,
  loadingSessions,
  isStaff,
  staffClasses,
  onSave,
  isPending,
}: AddGlobalDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  const isUploadMode = mode === 'upload'

  useEffect(() => {
    if (!show) {
      setUploading(false)
      setUploadedFileName('')
    }
  }, [show])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    const sizeError = getUploadFileError(file)
    if (sizeError) {
      toast.error(sizeError)
      input.value = ''
      return
    }

    setUploading(true)
    try {
      const res = await classesApi.uploadFile(file)
      setDocForm((prev) => ({
        ...prev,
        title: prev.title || res.fileName,
        fileUrl: res.fileUrl,
        fileType: getFileTypeFromName(res.fileName),
        fileSizeKb: Math.round(file.size / 1024),
      }))
      setUploadedFileName(res.fileName)
      toast.success('Tải file lên thành công')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tải file lên thất bại'))
    } finally {
      setUploading(false)
      input.value = ''
    }
  }

  const modalTitle = isUploadMode ? 'Tải lên tài liệu học tập' : 'Kết nối Google Drive'
  const modalDescription = isUploadMode
    ? 'Chọn file từ máy tính để tải lên hệ thống. Tối đa 5MB / file.'
    : 'Dán liên kết chia sẻ Google Drive để học viên truy cập tài liệu trực tiếp.'
  const submitLabel = isUploadMode ? 'Tải lên tài liệu' : 'Lưu liên kết Drive'

  return (
    <Modal
      open={show}
      onOpenChange={onClose}
      title={modalTitle}
      description={modalDescription}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="h-10 flex-1 rounded text-xs font-bold"
            onClick={onClose}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            form="add-doc-form"
            loading={isPending || uploading}
            className="h-10 flex-1 text-xs font-bold"
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="add-doc-form" onSubmit={onSave} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wider">
            Lớp học gán tài liệu *
          </label>
          <CustomDropdown
            value={selectedClassId}
            options={normalizedClasses}
            onChange={(val) => {
              setSelectedClassId(val)
              setSelectedSessionId('')
            }}
            placeholder="Chọn lớp học tương ứng..."
          />
        </div>

        {selectedClassId && (
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider">
              Buổi học (Session/Unit)
            </label>
            {loadingSessions ? (
              <div className="flex items-center gap-2 rounded border border-border bg-muted p-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                Đang tải danh sách buổi học...
              </div>
            ) : (
              <CustomDropdown
                value={selectedSessionId}
                options={[
                  { id: '', name: 'Tài liệu chung của lớp (Không gắn buổi cụ thể)' },
                  ...sessions.map((s) => ({
                    id: s.id,
                    name: `Buổi ${s.sessionNumber}: ${s.topic || 'Không có chủ đề'}`,
                  })),
                ]}
                onChange={(val) => setSelectedSessionId(val)}
                placeholder="Chọn buổi học tương ứng (tùy chọn)..."
              />
            )}
          </div>
        )}

        {isUploadMode ? (
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider">
              Chọn file tài liệu *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-primary-300 bg-primary-50/40 px-4 py-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="text-xs font-semibold text-primary-700">Đang tải lên...</span>
                </>
              ) : docForm.fileUrl ? (
                <>
                  <FileText className="h-6 w-6 text-primary-600" />
                  <span className="text-xs font-bold text-foreground">{uploadedFileName || docForm.title}</span>
                  <span className="text-xs text-muted-foreground">Bấm để chọn file khác</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-primary-600" />
                  <span className="text-xs font-bold text-primary-700">Bấm để chọn file từ máy tính</span>
                  <span className="text-xs text-muted-foreground">PDF, Word, PowerPoint... Tối đa 5MB</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider">
              Đường dẫn Google Drive *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <GoogleDriveIcon className="h-4 w-4" />
              </div>
              <Input
                value={docForm.fileUrl}
                onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value, fileType: 'drive' })}
                placeholder="https://drive.google.com/..."
                required
                className="h-10 rounded pl-9 text-xs"
              />
            </div>
            {docForm.fileUrl.includes('drive.google.com') && (
              <p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Đã nhận dạng liên kết Google Drive!
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wider">
            Tiêu đề tài liệu *
          </label>
          <Input
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            placeholder="Ví dụ: Tài liệu bổ trợ Nghe Nói IPA"
            required
            className="h-10 rounded text-xs"
          />
        </div>

        {!isUploadMode && (
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider">Loại tệp</label>
              <CustomDropdown
                value={docForm.fileType}
                options={[
                  { id: 'drive', name: 'Google Drive' },
                  { id: 'pdf', name: 'Tài liệu PDF' },
                  { id: 'word', name: 'Tài liệu Word' },
                  { id: 'ppt', name: 'PowerPoint' },
                  { id: 'other', name: 'Link ngoài khác' },
                ]}
                onChange={(val) => setDocForm({ ...docForm, fileType: val })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider">
                Dung lượng ước lượng (KB)
              </label>
              <Input
                type="number"
                min="0"
                value={docForm.fileSizeKb}
                onChange={(e) => setDocForm({ ...docForm, fileSizeKb: Number(e.target.value) })}
                placeholder="Không bắt buộc"
                className="h-10 rounded text-xs"
              />
            </div>
          </div>
        )}

        {isStaff && staffClasses.length > 1 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <label className="block text-xs uppercase tracking-wider">
              Đồng thời chia sẻ tài liệu với lớp khác
            </label>
            <div className="max-h-[100px] space-y-2 overflow-y-auto rounded border border-border bg-muted/50 p-2.5">
              {staffClasses
                .filter((c) => c.id !== selectedClassId)
                .map((c) => {
                  const checked = shareClassIds.includes(c.id)
                  return (
                    <label
                      key={c.id}
                      className="flex cursor-pointer select-none items-center gap-2 text-xs font-semibold text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setShareClassIds(shareClassIds.filter((id) => id !== c.id))
                          } else {
                            setShareClassIds([...shareClassIds, c.id])
                          }
                        }}
                        className="h-3.5 w-3.5 rounded text-primary-500 focus:ring-primary-500/20"
                      />
                      <span className="truncate">{c.name}</span>
                    </label>
                  )
                })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}

export { GoogleDriveIcon }

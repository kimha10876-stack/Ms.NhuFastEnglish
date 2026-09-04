import React from 'react'
import { Link2, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal } from '@/shared/components/Modal'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'

interface AddDocumentModalProps {
  show: boolean
  onClose: () => void
  selectedSessionForDoc: string | null
  docForm: {
    title: string
    fileUrl: string
    fileType: string
    fileSizeKb: number
  }
  setDocForm: React.Dispatch<
    React.SetStateAction<{
      title: string
      fileUrl: string
      fileType: string
      fileSizeKb: number
    }>
  >
  otherActiveClasses: Array<{ id: string; name: string }>
  shareClassIds: string[]
  setShareClassIds: React.Dispatch<React.SetStateAction<string[]>>
  onSave: (e: React.FormEvent) => void
  isPending: boolean
}

export function AddDocumentModal({
  show,
  onClose,
  selectedSessionForDoc,
  docForm,
  setDocForm,
  otherActiveClasses,
  shareClassIds,
  setShareClassIds,
  onSave,
  isPending,
}: AddDocumentModalProps) {
  return (
    <Modal
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title="Thêm tài liệu học tập"
      description={
        selectedSessionForDoc
          ? 'Tài liệu này sẽ được đính kèm vào Unit của buổi học.'
          : 'Tài liệu này sẽ xuất hiện trong phần Giáo trình & Tài liệu chung của lớp.'
      }
      size="md"
    >
      <form onSubmit={onSave} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wider">Đường dẫn tài liệu (Link Google Drive) *</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={docForm.fileUrl}
              onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
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

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider">Tiêu đề tài liệu *</label>
          <Input
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            placeholder="Ví dụ: Tài liệu bổ trợ Nghe Nói IPA"
            required
            className="rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider">Định dạng file</label>
            <CustomDropdown
              value={docForm.fileType}
              options={[
                { id: 'drive', name: 'Google Drive' },
                { id: 'pdf', name: 'PDF Document (.pdf)' },
                { id: 'word', name: 'Microsoft Word (.docx)' },
                { id: 'ppt', name: 'Powerpoint (.pptx)' },
                { id: 'other', name: 'Link ngoài khác' },
              ]}
              onChange={(val) => setDocForm({ ...docForm, fileType: val })}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider">Dung lượng ước lượng (KB)</label>
            <Input
              type="number"
              min="0"
              value={docForm.fileSizeKb}
              onChange={(e) => setDocForm({ ...docForm, fileSizeKb: Number(e.target.value) })}
              className="rounded"
            />
          </div>
        </div>

        {otherActiveClasses.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <label className="block text-xs uppercase tracking-wider">Chia sẻ tài liệu này với các lớp khác</label>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Chọn lớp học để chia sẻ tài liệu này:</p>
            <div className="max-h-[120px] space-y-2 overflow-y-auto rounded border border-border bg-muted/50 p-3">
              {otherActiveClasses.map((c) => {
                const checked = shareClassIds.includes(c.id)
                return (
                  <label key={c.id} className="flex cursor-pointer select-none items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setShareClassIds(shareClassIds.filter((cid) => cid !== c.id))
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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="h-9 flex-1 rounded text-xs font-bold" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={isPending} className="h-9 flex-1 text-xs font-bold">
            Thêm tài liệu
          </Button>
        </div>
      </form>
    </Modal>
  )
}

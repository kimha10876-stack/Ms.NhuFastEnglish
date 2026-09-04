import React from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal } from '@/shared/components/Modal'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import type { ClassSession } from '@/features/classes/classes.types'

interface AddSessionModalProps {
  show: boolean
  onClose: () => void
  editingSession: ClassSession | null
  sessionForm: {
    sessionNumber: number
    sessionDate: string
    startTime: string
    endTime: string
    topic: string
    note: string
    guestTeacherId: string
  }
  setSessionForm: React.Dispatch<
    React.SetStateAction<{
      sessionNumber: number
      sessionDate: string
      startTime: string
      endTime: string
      topic: string
      note: string
      guestTeacherId: string
    }>
  >
  teachersList: Array<{ userId: string; fullName: string }>
  onSave: (e: React.FormEvent) => void
  isPending: boolean
}

export function AddSessionModal({
  show,
  onClose,
  editingSession,
  sessionForm,
  setSessionForm,
  teachersList,
  onSave,
  isPending,
}: AddSessionModalProps) {
  return (
    <Modal
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title={editingSession ? 'Cập nhật buổi học' : 'Thêm buổi học mới (Unit)'}
      size="md"
      showClose
    >
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider">Số buổi (Unit #)</label>
            <Input
              type="number"
              min="1"
              value={sessionForm.sessionNumber}
              onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: Number(e.target.value) })}
              required
              className="rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider">Ngày học</label>
            <Input
              type="date"
              value={sessionForm.sessionDate}
              onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
              required
              className="rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider">Giờ bắt đầu</label>
            <Input
              type="time"
              value={sessionForm.startTime}
              onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
              required
              className="rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider">Giờ kết thúc</label>
            <Input
              type="time"
              value={sessionForm.endTime}
              onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
              required
              className="rounded"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider">Chủ đề (Topic)</label>
          <Input
            value={sessionForm.topic}
            onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
            placeholder="ví dụ: Unit 1: Pronunciation"
            required
            className="rounded"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider">Giáo viên dạy thay (Tùy chọn)</label>
          <CustomDropdown
            value={sessionForm.guestTeacherId || 'none'}
            options={[
              { id: 'none', name: 'Giáo viên chính của lớp' },
              ...teachersList.map((t) => ({ id: t.userId, name: t.fullName })),
            ]}
            onChange={(val) => setSessionForm({ ...sessionForm, guestTeacherId: val === 'none' ? '' : val })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider">Ghi chú / Nội dung chính</label>
          <textarea
            value={sessionForm.note}
            onChange={(e) => setSessionForm({ ...sessionForm, note: e.target.value })}
            placeholder="Mô tả nội dung buổi học..."
            className="w-full min-h-[80px] rounded border border-border p-3 text-sm focus:border-primary-500 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1 rounded" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  )
}

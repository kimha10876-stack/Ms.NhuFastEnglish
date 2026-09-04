import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal } from '@/shared/components/Modal'
import { toast } from '@/shared/utils/toast'
import type { ClassDetail } from '@/features/classes/classes.types'

interface ImportCurriculumModalProps {
  show: boolean
  cls: ClassDetail | undefined
  templates: any[]
  onClose: () => void
  onImport: (templateId: string, startDate: string, weekdays: number[]) => void
  isPending: boolean
}

export function ImportCurriculumModal({
  show,
  cls,
  templates,
  onClose,
  onImport,
  isPending,
}: ImportCurriculumModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [startDate, setStartDate] = useState(
    cls?.startDate ? cls.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
  )
  const [weekdays, setWeekdays] = useState<number[]>([])

  useEffect(() => {
    if (cls?.scheduleDays) {
      const days: number[] = []
      const scheduleLower = cls.scheduleDays.toLowerCase()
      if (scheduleLower.includes('t2') || scheduleLower.includes('2') || scheduleLower.includes('monday')) days.push(1)
      if (scheduleLower.includes('t3') || scheduleLower.includes('3') || scheduleLower.includes('tuesday')) days.push(2)
      if (scheduleLower.includes('t4') || scheduleLower.includes('4') || scheduleLower.includes('wednesday')) days.push(3)
      if (scheduleLower.includes('t5') || scheduleLower.includes('5') || scheduleLower.includes('thursday')) days.push(4)
      if (scheduleLower.includes('t6') || scheduleLower.includes('6') || scheduleLower.includes('friday')) days.push(5)
      if (scheduleLower.includes('t7') || scheduleLower.includes('7') || scheduleLower.includes('saturday')) days.push(6)
      if (scheduleLower.includes('cn') || scheduleLower.includes('chủ nhật') || scheduleLower.includes('sunday')) days.push(7)
      setWeekdays(days)
    }
  }, [cls])

  const handleToggleWeekday = (day: number) => {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId) {
      toast.error('Vui lòng chọn một khung giáo trình mẫu')
      return
    }
    if (weekdays.length === 0) {
      toast.error('Vui lòng chọn ít nhất một thứ trong tuần để xếp lịch học')
      return
    }
    onImport(selectedTemplateId, startDate, weekdays)
  }

  const weekdayLabels = [
    { label: 'Thứ 2', value: 1 },
    { label: 'Thứ 3', value: 2 },
    { label: 'Thứ 4', value: 3 },
    { label: 'Thứ 5', value: 4 },
    { label: 'Thứ 6', value: 5 },
    { label: 'Thứ 7', value: 6 },
    { label: 'Chủ Nhật', value: 7 },
  ]

  return (
    <Modal
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title="Nhập Khung Giáo Trình Mẫu"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider">Khung giáo trình mẫu</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            required
            className="w-full rounded border border-border bg-background p-2.5 text-sm font-medium focus:border-primary-500 focus:ring-primary-500/20"
          >
            <option value="">-- Chọn một khung mẫu --</option>
            {templates.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <p className="rounded bg-muted p-2.5 text-xs font-semibold leading-normal text-muted-foreground">
              {templates.find((t: any) => t.id === selectedTemplateId)?.description || 'Không có mô tả.'}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider">Ngày bắt đầu học</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="rounded" />
          <p className="text-xs font-semibold leading-normal text-muted-foreground">
            Các buổi học sẽ được tự động xếp lịch bắt đầu từ ngày này.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="mb-1 block text-xs uppercase tracking-wider">Lịch học hàng tuần</label>
          <div className="flex flex-wrap gap-2">
            {weekdayLabels.map((wd) => {
              const isSelected = weekdays.includes(wd.value)
              return (
                <button
                  key={wd.value}
                  type="button"
                  onClick={() => handleToggleWeekday(wd.value)}
                  className={`rounded px-3 py-1.5 text-xs font-extrabold transition-all ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'border border-border bg-muted text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {wd.label}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs font-semibold leading-normal text-muted-foreground">
            (Hệ thống tự động tích sẵn dựa trên lịch học hiện tại của lớp)
          </p>
        </div>

        <div className="mt-6 flex gap-3 border-t border-border pt-4">
          <Button type="button" variant="secondary" className="h-11 flex-1 rounded text-xs font-semibold" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={isPending} className="h-11 flex-1 text-xs font-semibold">
            Xác nhận nhập
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { Modal } from '@/shared/components'
import TeacherSelect from '@/features/classes/TeacherSelect'
import type { CreateClassRequest } from '../../classes.types'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CreateClassModalProps {
  show: boolean
  onClose: () => void
  form: CreateClassRequest
  setForm: React.Dispatch<React.SetStateAction<CreateClassRequest>>
  setField: (field: keyof CreateClassRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  apiCategories: Array<{ id: number; name: string }>
  isAdmin: boolean
  formError: string
  handleCreate: (e: React.FormEvent) => void
  isPending: boolean
}

export function CreateClassModal({
  show,
  onClose,
  form,
  setForm,
  setField,
  apiCategories,
  isAdmin,
  formError,
  handleCreate,
  isPending,
}: CreateClassModalProps) {
  return (
    <Modal
      open={show}
      onOpenChange={onClose}
      title="Tạo lớp học mới"
      description="Điền thông tin cơ bản của lớp"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded text-xs font-bold"
            onClick={onClose}
          >
            Huỷ bỏ
          </Button>
          <Button
            type="submit"
            form="create-class-form"
            className="flex-1 text-xs font-bold"
            loading={isPending}
          >
            Tạo lớp
          </Button>
        </>
      }
    >
      <form id="create-class-form" onSubmit={handleCreate} className="space-y-4 text-left">
        <div className="space-y-1.5">
 <label className="text-sm ">
            Tên lớp <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: Lớp giao tiếp tháng 7"
            value={form.name}
            onChange={setField('name')}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
 <label className="text-sm ">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              value={form.categoryId}
              options={apiCategories}
              onChange={(val) => setForm((p) => ({ ...p, categoryId: Number(val) }))}
            />
          </div>
          <div className="space-y-1.5">
 <label className="text-sm ">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <Input type="date" value={form.startDate} onChange={setField('startDate')} required />
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-1.5">
 <label className="text-sm ">
              Giáo viên phụ trách <span className="text-red-500">*</span>
            </label>
            <TeacherSelect
              value={form.teacherId}
              onChange={(val: string) => setForm((p) => ({ ...p, teacherId: val }))}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
 <label className="text-sm ">Học phí mỗi tháng (VNĐ)</label>
            <Input
              type="number"
              placeholder="VD: 800000"
              value={form.monthlyFee ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, monthlyFee: Number(e.target.value) || 0 }))}
              min={0}
              step={50000}
            />
          </div>
          <div className="space-y-1.5">
 <label className="text-sm ">Số học viên tối đa</label>
            <Input
              type="number"
              placeholder="Không giới hạn"
              value={form.maxStudents ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, maxStudents: e.target.value ? Number(e.target.value) : undefined }))
              }
              min={1}
            />
          </div>
        </div>

        <div className="space-y-1.5">
 <label className="text-sm ">Lịch học</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => {
              const currentDays = form.scheduleDays
                ? form.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean)
                : []
              const isSelected = currentDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newDays = isSelected
                      ? currentDays.filter((d) => d !== day)
                      : [...currentDays, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
                    setForm((p) => ({ ...p, scheduleDays: newDays.join(',') }))
                  }}
                  className={`h-9 rounded border px-3 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
 <label className="text-sm ">Giờ học</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="time"
                value={(form.scheduleTime || '').split('-')[0]?.trim() || ''}
                onChange={(e) => {
                  const newStart = e.target.value
                  setForm((p) => {
                    const [, currentEnd = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                    return {
                      ...p,
                      scheduleTime: newStart || currentEnd ? `${newStart}-${currentEnd}` : '',
                    }
                  })
                }}
                className="w-full text-center"
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">đến</span>
            <div className="relative flex-1">
              <Input
                type="time"
                value={(form.scheduleTime || '').split('-')[1]?.trim() || ''}
                onChange={(e) => {
                  const newEnd = e.target.value
                  setForm((p) => {
                    const [currentStart = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                    return {
                      ...p,
                      scheduleTime: currentStart || newEnd ? `${currentStart}-${newEnd}` : '',
                    }
                  })
                }}
                className="w-full text-center"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
 <label className="text-sm ">Ghi chú</label>
          <Input placeholder="Ghi chú thêm..." value={form.note ?? ''} onChange={setField('note')} />
        </div>

        {formError && (
          <div className="flex shrink-0 items-center gap-2 rounded-r-xl border-l-4 border-red-500 bg-red-50 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-[13px] font-medium text-red-700">{formError}</p>
          </div>
        )}
      </form>
    </Modal>
  )
}

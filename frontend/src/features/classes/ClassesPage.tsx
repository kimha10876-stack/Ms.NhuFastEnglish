import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Clock, MapPin, BookOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import { useClasses, useCreateClass } from './useClasses'
import type { CreateClassRequest } from './classes.types'

const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended:  'Đã kết thúc',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended:  'bg-gray-100 text-gray-500',
}

const CATEGORIES = [
  { id: 1, name: 'Giao tiếp' },
  { id: 2, name: 'IELTS' },
  { id: 3, name: 'Thiếu nhi' },
  { id: 4, name: 'Luyện thi' },
  { id: 5, name: 'Mất gốc' },
  { id: 6, name: 'Doanh nghiệp' },
]

const EMPTY_FORM: CreateClassRequest = {
  name:         '',
  categoryId:   1,
  teacherId:    '',
  startDate:    new Date().toISOString().slice(0, 10),
  scheduleDays: '',
  scheduleTime: '',
  room:         '',
  note:         '',
  maxStudents:  undefined,
}

export default function ClassesPage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const isAdmin  = user?.roles.includes('Admin') ?? false

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState<CreateClassRequest>({
    ...EMPTY_FORM,
    teacherId: isAdmin ? '' : (user?.id ?? ''),
  })
  const [formError, setFormError] = useState('')

  const { data: classes = [], isLoading } = useClasses()
  const { mutate: create, isPending }     = useCreateClass()

  const set = (field: keyof CreateClassRequest) =>
    (e: { target: { value: string } }) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleCreate = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setFormError('')
    if (!form.teacherId.trim()) {
      setFormError('Vui lòng nhập ID giáo viên phụ trách')
      return
    }
    create(
      {
        ...form,
        categoryId:  Number(form.categoryId),
        maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          setForm({ ...EMPTY_FORM, teacherId: isAdmin ? '' : (user?.id ?? '') })
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          setFormError(msg ?? 'Tạo lớp thất bại, vui lòng thử lại')
        },
      }
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lớp học</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? 'Đang tải...' : `${classes.length} lớp`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo lớp mới
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">Chưa có lớp học nào</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Nhấn "Tạo lớp mới" để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/classes/${cls.id}`)}
              className="group text-left bg-white rounded-2xl border border-black/[0.06] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5"
            >
              {/* Category badge + status */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: cls.categoryColorHex }}
                >
                  {cls.categoryName}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
                  {STATUS_LABEL[cls.status] ?? cls.status}
                </span>
              </div>

              {/* Class name */}
              <h3 className="font-bold text-[15px] leading-snug mb-1 group-hover:text-primary transition-colors">
                {cls.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{cls.teacherName}</p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {cls.memberCount} học sinh
                </span>
                {cls.scheduleDays && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {cls.scheduleDays} {cls.scheduleTime}
                  </span>
                )}
                {cls.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {cls.room}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">Tạo lớp học mới</h2>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên lớp *</label>
                <Input placeholder="VD: Lớp giao tiếp tháng 7" value={form.name} onChange={set('name')} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Danh mục *</label>
                  <select
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ngày bắt đầu *</label>
                  <Input type="date" value={form.startDate} onChange={set('startDate')} required />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">ID giáo viên *</label>
                  <Input
                    placeholder="UUID giáo viên phụ trách"
                    value={form.teacherId}
                    onChange={set('teacherId')}
                  />
                  <p className="text-xs text-muted-foreground">Nhập ID tài khoản giáo viên</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Lịch học</label>
                  <Input placeholder="T2,T4,T6" value={form.scheduleDays ?? ''} onChange={set('scheduleDays')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Giờ học</label>
                  <Input placeholder="08:00-10:00" value={form.scheduleTime ?? ''} onChange={set('scheduleTime')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phòng học</label>
                  <Input placeholder="Phòng A1" value={form.room ?? ''} onChange={set('room')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Giới hạn học sinh</label>
                  <Input
                    type="number"
                    placeholder="20"
                    min="1"
                    value={form.maxStudents ?? ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        maxStudents: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ghi chú</label>
                <Input placeholder="Ghi chú thêm..." value={form.note ?? ''} onChange={set('note')} />
              </div>

              {formError && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                  Huỷ
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? 'Đang tạo...' : 'Tạo lớp'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

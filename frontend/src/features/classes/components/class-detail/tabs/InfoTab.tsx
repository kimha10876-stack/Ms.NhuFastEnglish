import {
  CheckCircle2, AlertCircle, GraduationCap, Calendar, MapPin, Users, Info, Save, Edit2, Trash2
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import TeacherSelect from '@/features/classes/TeacherSelect'
import type { ClassDetail, UpdateClassRequest, ClassCategory } from '@/features/classes/classes.types'
import { STATUS_OPTIONS, STATUS_LABEL, STATUS_COLOR, WEEKDAYS } from '../utils'

interface InfoTabProps {
  cls: ClassDetail
  categories: ClassCategory[]
  isStaff: boolean
  isAdmin: boolean
  editForm: UpdateClassRequest | null
  setEditForm: React.Dispatch<React.SetStateAction<UpdateClassRequest | null>>
  editError: string
  setEditError: (err: string) => void
  updateSuccess: boolean
  updating: boolean
  startEdit: () => void
  handleSaveClassInfo: () => void
  handleDelete: () => void
}

export function InfoTab({
  cls,
  categories,
  isStaff,
  isAdmin,
  editForm,
  setEditForm,
  editError,
  setEditError,
  updateSuccess,
  updating,
  startEdit,
  handleSaveClassInfo,
  handleDelete,
}: InfoTabProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Success / Error Alerts */}
      {updateSuccess && (
        <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Đã cập nhật thông tin lớp học thành công!</span>
        </div>
      )}

      {editError && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{editError}</span>
        </div>
      )}

      {/* Basic Info Card (Tên lớp) */}
      {editForm && (
        <div className="bg-primary-50/40 border border-primary-200 rounded p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="text-primary-900 font-extrabold uppercase tracking-wider flex items-center gap-1">
              Tên lớp học <span className="text-red-500">*</span>
            </span>
            <Input
              value={editForm.name ?? ''}
              onChange={(e) => setEditForm((p) => (p ? { ...p, name: e.target.value } : p))}
              className="font-bold text-gray-950 text-sm rounded bg-background border-primary-300 focus:border-primary-500"
              placeholder="Nhập tên lớp học..."
              required
            />
          </div>
        </div>
      )}

      {isStaff && (
        <div className="flex justify-end gap-3">
          {editForm ? (
            <>
              <Button
                type="button"
                onClick={() => {
                  setEditForm(null)
                  setEditError('')
                }}
                variant="secondary"
                className="h-9 rounded px-5 text-xs font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                loading={updating}
                onClick={handleSaveClassInfo}
                className="h-9 gap-1.5 px-5 text-xs font-bold shadow-sm"
              >
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={startEdit}
                variant="secondary"
                className="h-9 gap-1.5 rounded px-4 text-xs font-semibold"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Chỉnh sửa thông tin
              </Button>
              {isAdmin && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="outline"
                  className="h-9 gap-1.5 rounded border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa lớp học
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Học thuật & Phụ trách */}
        <div className="bg-background border border-border rounded p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="font-extrabold text-ink-900 text-sm border-b border-border pb-2 flex items-center gap-1.5">
            <GraduationCap className="h-4.5 w-4.5 text-primary-500" />
            Học thuật & Quản lý
          </h4>

          <div className="space-y-3.5">
            {/* Danh mục */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Chương trình học</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <select
                    value={editForm.categoryId ?? ''}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, categoryId: Number(e.target.value) } : p))}
                    className="w-full text-xs font-bold text-foreground bg-muted border border-border rounded p-2 focus:border-primary-500 focus:ring-primary-500/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: cls.categoryColorHex }}
                >
                  {cls.categoryName}
                </span>
              )}
            </div>

            {/* Giáo viên */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Giáo viên phụ trách</span>
              {editForm && isStaff ? (
                <div className="w-56 shrink-0">
                  <TeacherSelect
                    value={editForm.teacherId ?? ''}
                    onChange={(val: string) => setEditForm((p) => (p ? { ...p, teacherId: val } : p))}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                    <span className="text-xs font-bold text-primary-700">{cls.teacherName[0]?.toUpperCase()}</span>
                  </div>
                  <span className="font-bold text-ink-900">{cls.teacherName}</span>
                </div>
              )}
            </div>

            {/* Ngày khai giảng */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Ngày bắt đầu</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <Input
                    type="date"
                    value={editForm.startDate ?? ''}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, startDate: e.target.value } : p))}
                    className="w-full text-xs font-bold rounded"
                  />
                </div>
              ) : (
                <span className="font-bold text-ink-900">
                  {new Date(cls.startDate).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            {/* Ngày kết thúc */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Ngày kết thúc</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <Input
                    type="date"
                    value={editForm.endDate ?? ''}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, endDate: e.target.value || undefined } : p))}
                    className="w-full text-xs font-bold rounded"
                  />
                </div>
              ) : (
                <span className="font-bold text-ink-900">
                  {cls.endDate ? (
                    new Date(cls.endDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  ) : (
                    <span className="text-muted-foreground italic">Chưa thiết lập</span>
                  )}
                </span>
              )}
            </div>

            {/* Trạng thái lớp */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Trạng thái</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <CustomDropdown
                    value={editForm.status ?? 'active'}
                    options={STATUS_OPTIONS.map((s) => ({ id: s, name: STATUS_LABEL[s] }))}
                    onChange={(val) => setEditForm((p) => (p ? { ...p, status: val } : p))}
                  />
                </div>
              ) : (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                    STATUS_COLOR[cls.status] ?? STATUS_COLOR.active
                  }`}
                >
                  {STATUS_LABEL[cls.status] ?? cls.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Lịch học & Thời khóa biểu */}
        <div className="bg-background border border-border rounded p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="font-extrabold text-ink-900 text-sm border-b border-border pb-2 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-primary-500" />
            Lịch học & Thời gian
          </h4>

          <div className="space-y-3.5">
            {/* Ngày học */}
            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Lịch học trong tuần</span>
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {WEEKDAYS.map((day) => {
                  const currentDays = editForm
                    ? editForm.scheduleDays
                      ? editForm.scheduleDays
                          .split(',')
                          .map((d) => d.trim())
                          .filter(Boolean)
                      : []
                    : cls.scheduleDays
                    ? cls.scheduleDays
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean)
                    : []
                  const isSelected = currentDays.includes(day)

                  if (editForm) {
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected
                            ? currentDays.filter((d) => d !== day)
                            : [...currentDays, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
                          setEditForm((p) => (p ? { ...p, scheduleDays: newDays.join(',') } : p))
                        }}
                        className={`h-7 px-2.5 rounded text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-primary-500 border-primary-600 text-white shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  }

                  return (
                    <span
                      key={day}
                      className={`h-7 px-2.5 rounded text-xs font-bold border flex items-center justify-center select-none transition-all ${
                        isSelected
                          ? 'bg-primary-500 border-primary-600 text-white shadow-sm'
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      {day}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Giờ học */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Khung giờ học</span>
              {editForm ? (
                <div className="w-56 shrink-0 flex items-center gap-2">
                  <Input
                    type="time"
                    value={(editForm.scheduleTime || '').split('-')[0]?.trim() || ''}
                    onChange={(e) => {
                      const newStart = e.target.value
                      setEditForm((p) => {
                        if (!p) return null
                        const [, currentEnd = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                        return {
                          ...p,
                          scheduleTime: newStart || currentEnd ? `${newStart}-${currentEnd}` : '',
                        }
                      })
                    }}
                    className="w-full text-center rounded h-8 text-xs font-bold"
                  />
                  <span className="text-muted-foreground text-xs font-medium">đến</span>
                  <Input
                    type="time"
                    value={(editForm.scheduleTime || '').split('-')[1]?.trim() || ''}
                    onChange={(e) => {
                      const newEnd = e.target.value
                      setEditForm((p) => {
                        if (!p) return null
                        const [currentStart = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                        return {
                          ...p,
                          scheduleTime: currentStart || newEnd ? `${currentStart}-${newEnd}` : '',
                        }
                      })
                    }}
                    className="w-full text-center rounded h-8 text-xs font-bold"
                  />
                </div>
              ) : (
                <span className="font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded text-xs">
                  {cls.scheduleTime || 'Chưa thiết lập'}
                </span>
              )}
            </div>

            {/* Phòng học */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Phòng học</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <Input
                    type="text"
                    placeholder="VD: Phòng 201"
                    value={editForm.room ?? ''}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, room: e.target.value } : p))}
                    className="w-full text-xs font-bold rounded h-8"
                  />
                </div>
              ) : (
                <span className="font-bold text-ink-900 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {cls.room || 'Chưa thiết lập'}
                </span>
              )}
            </div>

            {/* Học phí mỗi tháng */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Học phí mỗi tháng</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <Input
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="VD: 800000"
                    value={editForm.monthlyFee ?? 0}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, monthlyFee: Number(e.target.value) || 0 } : p))}
                    className="w-full text-xs font-bold rounded h-8"
                  />
                </div>
              ) : (
                <span className="font-extrabold text-primary-700">
                  {cls.monthlyFee > 0
                    ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng`
                    : 'Miễn phí / Chưa cấu hình'}
                </span>
              )}
            </div>

            {/* Sĩ số */}
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Sĩ số lớp học</span>
              {editForm ? (
                <div className="w-56 shrink-0">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Không giới hạn"
                    value={editForm.maxStudents ?? ''}
                    onChange={(e) =>
                      setEditForm((p) =>
                        p ? { ...p, maxStudents: e.target.value ? Number(e.target.value) : undefined } : p
                      )
                    }
                    className="w-full text-xs font-bold rounded h-8"
                  />
                </div>
              ) : (
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {cls.members.length} / {cls.maxStudents ?? '∞'} học viên
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Ghi chú lớp học */}
      {editForm ? (
        <div className="bg-primary-50/30 border border-primary-200/40 rounded p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary-600" />
            <h5 className="font-bold text-ink-900 text-xs uppercase tracking-wider">Ghi chú lớp học</h5>
          </div>
          <textarea
            value={editForm.note ?? ''}
            onChange={(e) => setEditForm((p) => (p ? { ...p, note: e.target.value } : p))}
            placeholder="Ghi chú lớp học..."
            className="w-full min-h-[60px] p-3 text-xs rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 bg-background"
          />
        </div>
      ) : (
        cls.note && (
          <div className="bg-primary-50/30 border border-primary-200/40 rounded p-5 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 shadow-sm border border-primary-200/50 mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-ink-900 text-xs uppercase tracking-wider mb-1">Ghi chú lớp học</h5>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{cls.note}</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}

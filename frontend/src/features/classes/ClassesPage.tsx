import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Clock, BookOpen, ChevronRight, Search, ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import { useClasses, useCreateClass, useClassCategories } from './useClasses'
import type { CreateClassRequest } from './classes.types'
import TeacherSelect from './TeacherSelect'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'

const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended:  'Đã kết thúc',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  ended:  'bg-gray-100 text-gray-500 border-gray-200',
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

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

  // Bộ lọc, tìm kiếm và phân trang
  const [searchVal, setSearchVal]               = useState('')
  const [search, setSearch]                     = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [selectedStatus, setSelectedStatus]     = useState('')
  const [page, setPage]                         = useState(1)
  const pageSize                                = 9

  const { data, isLoading } = useClasses({
    search,
    categoryId: selectedCategory,
    status: selectedStatus,
    page,
    pageSize,
  })

  const classes = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const { data: apiCategories = [] }      = useClassCategories()
  const { mutate: create, isPending }     = useCreateClass()

  const openCreateModal = () => {
    setForm({
      ...EMPTY_FORM,
      categoryId: apiCategories[0]?.id || 1,
      teacherId: isAdmin ? '' : (user?.id ?? ''),
    })
    setShowCreate(true)
  }

  const set = (field: keyof CreateClassRequest) =>
    (e: { target: { value: string } }) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleCreate = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setFormError('')
    if (!form.teacherId.trim()) {
      setFormError('Vui lòng chọn giáo viên phụ trách')
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
    <div className="p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Quản lý</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lớp học</h1>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5 rounded-xl font-bold text-xs">
          <Plus className="h-4 w-4" />
          Tạo lớp mới
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(searchVal)
          setPage(1)
        }}
        className="flex flex-col md:flex-row gap-3 mb-6 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
      >
        {/* Search Input + Button group */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên lớp, phòng học, ghi chú..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-10 rounded-xl text-sm border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 w-full"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>
          <Button type="submit" className="rounded-xl font-bold text-xs px-4 h-9 gap-1 shadow-sm shrink-0">
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </Button>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <CustomDropdown
            value={selectedCategory ?? 'all'}
            options={[
              { id: 'all', name: 'Tất cả danh mục' },
              ...apiCategories.map(c => ({ id: c.id, name: c.name }))
            ]}
            onChange={(val) => {
              setSelectedCategory(val === 'all' ? undefined : Number(val))
              setPage(1)
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <CustomDropdown
            value={selectedStatus}
            options={[
              { id: '', name: 'Tất cả trạng thái' },
              { id: 'active', name: 'Đang hoạt động' },
              { id: 'paused', name: 'Tạm dừng' },
              { id: 'ended', name: 'Đã kết thúc' }
            ]}
            onChange={(val) => {
              setSelectedStatus(val)
              setPage(1)
            }}
          />
        </div>

        {/* Reset button */}
        {(search || selectedCategory !== undefined || selectedStatus || searchVal) && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchVal('')
              setSearch('')
              setSelectedCategory(undefined)
              setSelectedStatus('')
              setPage(1)
            }}
            className="text-gray-500 hover:text-gray-900 font-semibold text-xs px-3 rounded-xl border border-gray-200 hover:bg-gray-50 h-9"
          >
            Đặt lại
          </Button>
        )}
      </form>

      {/* ── Stats row ── */}
      {!isLoading && totalCount > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap animate-in fade-in duration-200">
          {[
            { label: 'Tổng lớp tìm thấy', value: totalCount },
            { label: 'Số lớp trang này', value: classes.length },
            { label: 'Sĩ số hiển thị', value: classes.reduce((s, c) => s + c.memberCount, 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        search || selectedCategory !== undefined || selectedStatus ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
              <Search className="h-6 w-6" />
            </div>
            <p className="font-bold text-gray-800 text-sm">Không tìm thấy lớp học nào phù hợp</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Vui lòng thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedCategory(undefined)
                setSelectedStatus('')
                setPage(1)
              }}
              className="rounded-xl font-bold text-xs"
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-amber-500" />
            </div>
            <p className="font-semibold text-gray-700">Chưa có lớp học nào</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Tạo lớp đầu tiên để bắt đầu quản lý học viên</p>
            <Button onClick={openCreateModal} className="rounded-xl font-bold text-xs">
              <Plus className="h-4 w-4" />
              Tạo lớp học
            </Button>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="group text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all p-5"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white tracking-wide"
                    style={{ backgroundColor: cls.categoryColorHex }}
                  >
                    {cls.categoryName}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
                    {STATUS_LABEL[cls.status] ?? cls.status}
                  </span>
                </div>

                {/* Class name */}
                <h3 className="font-bold text-[15px] text-gray-900 leading-snug mb-0.5 group-hover:text-amber-700 transition-colors">
                  {cls.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{cls.teacherName}</p>

                {/* Meta + arrow */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-wrap gap-2.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {cls.memberCount} học viên
                    </span>
                    {cls.scheduleDays && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {cls.scheduleDays}
                        {cls.scheduleTime && ` · ${cls.scheduleTime}`}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-400 shrink-0 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold text-gray-500">
                Hiển thị lớp học từ <span className="font-bold text-gray-900">{((page - 1) * pageSize) + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(page * pageSize, totalCount)}
                </span>{' '}
                trong tổng số <span className="font-bold text-gray-900">{totalCount}</span> lớp
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1
                  if (totalPages > 5 && Math.abs(pNum - page) > 1 && pNum !== 1 && pNum !== totalPages) {
                    if (pNum === 2 || pNum === totalPages - 1) {
                      return <span key={pNum} className="text-xs text-gray-400 px-1 font-bold">...</span>
                    }
                    return null
                  }

                  return (
                    <Button
                      key={pNum}
                      variant={page === pNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pNum)}
                      className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all ${
                        page === pNum
                          ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 hover:text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tạo lớp học mới</h2>
                <p className="text-sm text-gray-500 mt-0.5">Điền thông tin cơ bản của lớp</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Tên lớp <span className="text-red-500">*</span></label>
                <Input placeholder="VD: Lớp giao tiếp tháng 7" value={form.name} onChange={set('name')} required autoFocus />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                  <CustomDropdown
                    value={form.categoryId}
                    options={apiCategories}
                    onChange={(val) => setForm((p) => ({ ...p, categoryId: Number(val) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <Input type="date" value={form.startDate} onChange={set('startDate')} required />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Giáo viên phụ trách <span className="text-red-500">*</span></label>
                  <TeacherSelect
                    value={form.teacherId}
                    onChange={(val) => setForm((p) => ({ ...p, teacherId: val }))}
                  />
                </div>
              )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Lịch học</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {WEEKDAYS.map((day) => {
                      const currentDays = form.scheduleDays ? form.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean) : []
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
                          className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/20'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Giờ học</label>
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
                    <span className="text-gray-400 text-sm font-medium">đến</span>
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
                <label className="text-sm font-semibold text-gray-700">Ghi chú</label>
                <Input placeholder="Ghi chú thêm..." value={form.note ?? ''} onChange={set('note')} />
              </div>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>
                  Huỷ bỏ
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

import { useState } from 'react'
import {
  Users, Plus, Edit2, Trash2, Search, GraduationCap, Phone, Mail,
  Calendar, Loader2, Award, BookOpen, AlertTriangle, KeyRound,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent
} from './useStudents'
import type { CreateStudentRequest, UpdateStudentRequest, StudentDetail } from './students.types'

const LEVEL_OPTIONS = [
  { id: 'Mất gốc', name: 'Mất gốc' },
  { id: 'Cơ bản', name: 'Cơ bản' },
  { id: 'Trung cấp', name: 'Trung cấp' },
  { id: 'Nâng cao', name: 'Nâng cao' }
]

const GOAL_OPTIONS = [
  { id: 'Giao tiếp cơ bản', name: 'Giao tiếp cơ bản' },
  { id: 'Giao tiếp trôi chảy', name: 'Giao tiếp trôi chảy' },
  { id: 'Luyện thi IELTS', name: 'Luyện thi IELTS' },
  { id: 'Luyện thi THPT', name: 'Luyện thi THPT' }
]

const STATUS_OPTIONS = [
  { id: 'active', name: 'Đang hoạt động' },
  { id: 'inactive', name: 'Đã khóa' }
]

const EMPTY_FORM: CreateStudentRequest = {
  fullName: '',
  email: '',
  password: '123456',
  phone: '',
  level: 'Mất gốc',
  goal: 'Giao tiếp cơ bản',
  status: 'active'
}

export default function StudentsPage() {
  // Filters & Pagination state
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modals state
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [form, setForm] = useState<CreateStudentRequest>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<UpdateStudentRequest>({})
  const [errorMsg, setErrorMsg] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useStudents({
    search,
    level: levelFilter,
    goal: goalFilter,
    status: statusFilter,
    page,
    pageSize
  })

  const students = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const { mutate: createStudent, isPending: creating } = useCreateStudent()
  const { mutate: updateStudent, isPending: updating } = useUpdateStudent(selectedStudent?.studentId ?? '')
  const { mutate: deleteStudent, isPending: deleting } = useDeleteStudent()

  // Actions
  const handleOpenCreate = () => {
    setForm({ ...EMPTY_FORM })
    setErrorMsg('')
    setShowCreate(true)
  }

  const handleOpenEdit = (student: StudentDetail) => {
    setSelectedStudent(student)
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone ?? '',
      level: student.level,
      goal: student.goal,
      status: student.status,
      isActive: student.isActive,
      password: '' // empty password field for safety
    })
    setErrorMsg('')
    setShowEdit(true)
  }

  const handleOpenDetail = (student: StudentDetail) => {
    setSelectedStudent(student)
    setShowDetail(true)
  }

  const handleOpenDelete = (student: StudentDetail) => {
    setSelectedStudent(student)
    setShowDeleteConfirm(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    createStudent(form, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ ...EMPTY_FORM })
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Tạo tài khoản học viên thất bại'
        setErrorMsg(msg)
      }
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    setErrorMsg('')

    // Only send password if user filled it
    const payload = { ...editForm }
    if (!payload.password?.trim()) {
      delete payload.password
    }

    updateStudent(payload, {
      onSuccess: () => {
        setShowEdit(false)
        setSelectedStudent(null)
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Cập nhật tài khoản thất bại'
        setErrorMsg(msg)
      }
    })
  }

  const handleDelete = () => {
    if (!selectedStudent) return
    deleteStudent(selectedStudent.studentId, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        setSelectedStudent(null)
      }
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Quản lý</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-amber-500" />
            Học viên
          </h1>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5 rounded-xl font-bold text-xs">
          <Plus className="h-4 w-4" />
          Thêm học viên mới
        </Button>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(searchVal)
          setPage(1)
        }}
        className="flex flex-col xl:flex-row gap-3 mb-6 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
      >
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Tìm theo tên học viên, email, số điện thoại..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 rounded-xl text-sm border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 w-full"
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

        <div className="flex flex-wrap gap-2">
          {/* Level Filter */}
          <div className="w-40">
            <CustomDropdown
              value={levelFilter}
              options={[
                { id: '', name: 'Tất cả trình độ' },
                ...LEVEL_OPTIONS
              ]}
              onChange={(val) => { setLevelFilter(val); setPage(1) }}
            />
          </div>

          {/* Goal Filter */}
          <div className="w-44">
            <CustomDropdown
              value={goalFilter}
              options={[
                { id: '', name: 'Tất cả mục tiêu' },
                ...GOAL_OPTIONS
              ]}
              onChange={(val) => { setGoalFilter(val); setPage(1) }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <CustomDropdown
              value={statusFilter}
              options={[
                { id: '', name: 'Tất cả trạng thái' },
                { id: 'active', name: 'Đang hoạt động' },
                { id: 'inactive', name: 'Đã khóa' }
              ]}
              onChange={(val) => { setStatusFilter(val); setPage(1) }}
            />
          </div>

          {/* Reset Button */}
          {(search || levelFilter || goalFilter || statusFilter || searchVal) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchVal('')
                setSearch('')
                setLevelFilter('')
                setGoalFilter('')
                setStatusFilter('')
                setPage(1)
              }}
              className="text-gray-500 hover:text-gray-900 font-semibold text-xs px-3 rounded-xl border border-gray-200 hover:bg-gray-50 h-9"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </form>

      {/* Main Student List Section */}
      {isLoading ? (
        <div className="space-y-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-14 rounded-xl bg-gray-50 animate-pulse w-full" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-bold text-gray-800 text-sm">Không tìm thấy học viên nào phù hợp</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">Vui lòng thay đổi từ khóa tìm kiếm hoặc chỉnh lại các bộ lọc</p>
          {(search || levelFilter || goalFilter || statusFilter || searchVal) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchVal('')
                setSearch('')
                setLevelFilter('')
                setGoalFilter('')
                setStatusFilter('')
                setPage(1)
              }}
              className="rounded-xl font-bold text-xs"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table for Desktop */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Trình độ / Mục tiêu</th>
                  <th className="px-6 py-4">Số lớp đang học</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map((st) => (
                  <tr key={st.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200/50 text-amber-700 font-bold shrink-0">
                          {st.fullName[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate leading-snug">{st.fullName}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {st.phone || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded w-max">
                          Lvl: {st.level}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Goal: {st.goal}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/40"
                      >
                        <BookOpen className="h-3 w-3" />
                        {st.classes.length} lớp học
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {st.status === 'active' && st.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-500">
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(st)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {(st.status === 'active' || st.isActive) && (
                          <button
                            onClick={() => handleOpenDelete(st)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Khóa tài khoản"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-semibold text-gray-500">
                Hiển thị học viên từ <span className="font-bold text-gray-900">{((page - 1) * pageSize) + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(page * pageSize, totalCount)}
                </span>{' '}
                trong tổng số <span className="font-bold text-gray-900">{totalCount}</span> học viên
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dialog 1: Create Student Modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thêm học viên mới</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tạo tài khoản và hồ sơ học viên trong hệ thống</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                <Input
                  placeholder="VD: Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email đăng nhập <span className="text-red-500">*</span></label>
                  <Input
                    type="email"
                    placeholder="VD: user1@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-gray-400" />
                    Mật khẩu khởi tạo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={form.password}
                    readOnly
                    className="bg-gray-50 text-gray-500 cursor-not-allowed select-none font-mono"
                  />
                  <p className="text-[11px] text-amber-600 font-medium mt-1 leading-normal">
                    * Mật khẩu mặc định là 123456. Học viên bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                  <Input
                    placeholder="VD: 0905123456"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Trạng thái hồ sơ</label>
                  <CustomDropdown
                    value={form.status}
                    options={STATUS_OPTIONS}
                    onChange={(val: string) => setForm((p) => ({ ...p, status: val }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Trình độ đầu vào</label>
                  <CustomDropdown
                    value={form.level}
                    options={LEVEL_OPTIONS}
                    onChange={(val: string) => setForm((p) => ({ ...p, level: val }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mục tiêu tiếng Anh</label>
                  <CustomDropdown
                    value={form.goal}
                    options={GOAL_OPTIONS}
                    onChange={(val: string) => setForm((p) => ({ ...p, goal: val }))}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl flex items-center gap-2 shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700 font-medium">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2 shrink-0">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl text-xs font-bold" onClick={() => setShowCreate(false)}>
                  Huỷ bỏ
                </Button>
                <Button type="submit" className="flex-1 rounded-xl text-xs font-bold" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo tài khoản'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dialog 2: Edit Student Modal ── */}
      {showEdit && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Cập nhật thông tin học viên</h2>
                <p className="text-xs text-gray-400 mt-0.5">Sửa đổi thông tin tài khoản và cấu hình trình độ</p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                <Input
                  placeholder="VD: Nguyễn Văn A"
                  value={editForm.fullName ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email đăng nhập <span className="text-red-500">*</span></label>
                  <Input
                    type="email"
                    placeholder="VD: user1@gmail.com"
                    value={editForm.email ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-gray-400" />
                    Đổi mật khẩu (bỏ trống nếu giữ nguyên)
                  </label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={editForm.password ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                  <Input
                    placeholder="VD: 0905123456"
                    value={editForm.phone ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Trạng thái hồ sơ</label>
                  <CustomDropdown
                    value={editForm.status ?? 'active'}
                    options={STATUS_OPTIONS}
                    onChange={(val: string) => setEditForm((p) => ({ ...p, status: val }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Trình độ đầu vào</label>
                  <CustomDropdown
                    value={editForm.level ?? 'Mất gốc'}
                    options={LEVEL_OPTIONS}
                    onChange={(val: string) => setEditForm((p) => ({ ...p, level: val }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mục tiêu học tập</label>
                  <CustomDropdown
                    value={editForm.goal ?? 'Giao tiếp cơ bản'}
                    options={GOAL_OPTIONS}
                    onChange={(val: string) => setEditForm((p) => ({ ...p, goal: val }))}
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">Trạng thái kích hoạt tài khoản</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Tài khoản bị khóa sẽ không thể đăng nhập hệ thống</span>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.isActive ?? false}
                  onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-5 h-5 accent-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl flex items-center gap-2 shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700 font-medium">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2 shrink-0">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl text-xs font-bold" onClick={() => setShowEdit(false)}>
                  Huỷ bỏ
                </Button>
                <Button type="submit" className="flex-1 rounded-xl text-xs font-bold" disabled={updating}>
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dialog 3: Student Details Modal ── */}
      {showDetail && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowDetail(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg">
                  {selectedStudent.fullName[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">{selectedStudent.fullName}</h2>
                  <p className="text-xs text-gray-500 leading-none mt-1">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
              {/* Profile details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200/60 pb-1.5">Thông tin liên lạc</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">{selectedStudent.phone || 'Chưa cung cấp'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium truncate">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Ngày tham gia: <span className="font-semibold text-gray-800">
                        {new Date(selectedStudent.createdAt).toLocaleDateString('vi-VN')}
                      </span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200/60 pb-1.5">Hồ sơ học tập</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Cấp độ đầu vào:</span>
                      <span className="font-bold text-gray-800 bg-white px-2 py-0.5 border border-gray-200 rounded">{selectedStudent.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Mục tiêu mong muốn:</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200/40 rounded">{selectedStudent.goal}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Trạng thái tài khoản:</span>
                      {selectedStudent.status === 'active' && selectedStudent.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-50 border border-gray-200 text-gray-500">
                          Đã khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class memberships section */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  Các lớp học đã tham gia ({selectedStudent.classes.length})
                </h3>

                {selectedStudent.classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    Chưa ghi danh vào lớp học nào.
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {selectedStudent.classes.map((cls) => (
                      <div key={cls.classId} className="p-3.5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{cls.className}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: cls.categoryColorHex }}
                            >
                              {cls.categoryName}
                            </span>
                            <span>·</span>
                            <span>GV: <span className="font-medium text-gray-600">{cls.teacherName}</span></span>
                            <span>·</span>
                            <span>Vào lớp: <span className="font-medium text-gray-500">{new Date(cls.joinedAt).toLocaleDateString('vi-VN')}</span></span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize select-none shrink-0 ${
                          cls.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : cls.status === 'paused'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {cls.status === 'active' ? 'Đang học' : cls.status === 'paused' ? 'Tạm dừng' : 'Đã kết thúc'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end shrink-0">
              <Button type="button" className="rounded-xl font-bold text-xs px-5 h-9" onClick={() => setShowDetail(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialog 4: Confirm block student modal ── */}
      {showDeleteConfirm && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 border border-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">Khóa tài khoản học viên?</h3>
                <p className="text-xs text-gray-500 px-2 leading-relaxed">
                  Tài khoản của học viên <span className="font-bold text-gray-800">{selectedStudent.fullName}</span> sẽ bị vô hiệu hóa đăng nhập. Học viên cũng sẽ tự động bị rút ra khỏi tất cả các lớp đang tham gia.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2.5">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 shadow-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận khóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

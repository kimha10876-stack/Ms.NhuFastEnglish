import { useState } from 'react'
import {
  Users, Plus, Edit2, Trash2, Search, Phone, Mail,
  Calendar, Loader2, Award, BookOpen, AlertTriangle, KeyRound,
  ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher
} from './useTeachers'
import type { CreateTeacherRequest, UpdateTeacherRequest, TeacherDetail } from './teachers.types'

const TYPE_OPTIONS = [
  { id: 'permanent', name: 'Chính thức' },
  { id: 'guest', name: 'Dự giờ / Dạy thay' }
]

const STATUS_OPTIONS = [
  { id: 'active', name: 'Đang hoạt động' },
  { id: 'inactive', name: 'Đã khóa' }
]

const EMPTY_FORM: CreateTeacherRequest = {
  fullName: '',
  email: '',
  password: '123456',
  phone: '',
  type: 'permanent',
  bio: '',
  contractStart: new Date().toISOString().slice(0, 10),
  contractEnd: ''
}

export default function TeachersPage() {
  // Filters & Pagination state
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modals state
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(null)
  const [form, setForm] = useState<CreateTeacherRequest>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<UpdateTeacherRequest>({})
  const [errorMsg, setErrorMsg] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useTeachers({
    search,
    type: typeFilter,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
    pageSize
  })

  const teachers = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { mutate: createTeacher, isPending: creating } = useCreateTeacher()
  const { mutate: updateTeacher, isPending: updating } = useUpdateTeacher()
  const { mutate: deleteTeacher, isPending: deleting } = useDeleteTeacher()

  // Actions
  const handleOpenCreate = () => {
    setForm({ ...EMPTY_FORM })
    setErrorMsg('')
    setShowCreate(true)
  }

  const handleOpenEdit = (teacher: TeacherDetail) => {
    setSelectedTeacher(teacher)
    setEditForm({
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      type: teacher.type,
      bio: teacher.bio ?? '',
      contractStart: teacher.contractStart,
      contractEnd: teacher.contractEnd ?? '',
      isActive: teacher.isActive,
      password: '' // empty password field for safety
    })
    setErrorMsg('')
    setShowEdit(true)
  }

  const handleOpenDetail = (teacher: TeacherDetail) => {
    setSelectedTeacher(teacher)
    setShowDetail(true)
  }

  const handleOpenDelete = (teacher: TeacherDetail) => {
    setSelectedTeacher(teacher)
    setShowDeleteConfirm(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!form.phone.trim()) {
      setErrorMsg('Số điện thoại bắt buộc cho giáo viên')
      return
    }

    const payload = { ...form }
    if (!payload.contractEnd) {
      delete payload.contractEnd
    }

    createTeacher(payload, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ ...EMPTY_FORM })
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Tạo tài khoản giáo viên thất bại'
        setErrorMsg(msg)
      }
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setErrorMsg('')

    if (!editForm.phone?.trim()) {
      setErrorMsg('Số điện thoại bắt buộc cho giáo viên')
      return
    }

    const payload = { ...editForm }
    if (!payload.password?.trim()) {
      delete payload.password
    }
    if (!payload.contractEnd) {
      payload.contractEnd = undefined
    }

    updateTeacher({ id: selectedTeacher.teacherId, body: payload }, {
      onSuccess: () => {
        setShowEdit(false)
        setSelectedTeacher(null)
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Cập nhật tài khoản thất bại'
        setErrorMsg(msg)
      }
    })
  }

  const handleToggleActive = (teacher: TeacherDetail) => {
    setTogglingId(teacher.teacherId)
    updateTeacher(
      {
        id: teacher.teacherId,
        body: { isActive: !teacher.isActive }
      },
      {
        onSuccess: () => setTogglingId(null),
        onError: () => setTogglingId(null)
      }
    )
  }

  const handleDelete = () => {
    if (!selectedTeacher) return
    deleteTeacher(selectedTeacher.teacherId, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        setSelectedTeacher(null)
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
            <Briefcase className="h-7 w-7 text-amber-500" />
            Giáo viên
          </h1>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5 rounded-xl font-bold text-xs">
          <Plus className="h-4 w-4" />
          Thêm giáo viên mới
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
              placeholder="Tìm theo tên giáo viên, email, số điện thoại..."
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
          {/* Type Filter */}
          <div className="w-44">
            <CustomDropdown
              value={typeFilter}
              options={[
                { id: '', name: 'Tất cả loại hình' },
                ...TYPE_OPTIONS
              ]}
              onChange={(val) => { setTypeFilter(val); setPage(1) }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <CustomDropdown
              value={statusFilter}
              options={[
                { id: '', name: 'Tất cả trạng thái' },
                ...STATUS_OPTIONS
              ]}
              onChange={(val) => { setStatusFilter(val); setPage(1) }}
            />
          </div>

          {/* Reset Button */}
          {(search || typeFilter || statusFilter || searchVal) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchVal('')
                setSearch('')
                setTypeFilter('')
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

      {/* Main Teacher List Section */}
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
          <p className="font-bold text-gray-800 text-sm">Không tìm thấy giáo viên nào phù hợp</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">Vui lòng thay đổi từ khóa tìm kiếm hoặc chỉnh lại các bộ lọc</p>
          {(search || typeFilter || statusFilter || searchVal) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchVal('')
                setSearch('')
                setTypeFilter('')
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
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Giáo viên</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Thời hạn hợp đồng</th>
                  <th className="px-6 py-4">Lớp phụ trách</th>
                  <th className="px-6 py-4">Kích hoạt</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {teachers.map((te) => (
                  <tr key={te.teacherId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200/50 text-amber-700 font-bold shrink-0">
                          {te.fullName[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate leading-snug">{te.fullName}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{te.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {te.phone}
                    </td>
                    <td className="px-6 py-4">
                      {te.type === 'guest' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-700">
                          Dự giờ / Dạy thay
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                          Chính thức
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      <div>Từ: {new Date(te.contractStart).toLocaleDateString('vi-VN')}</div>
                      {te.contractEnd ? (
                        <div className="text-gray-400 mt-0.5">Đến: {new Date(te.contractEnd).toLocaleDateString('vi-VN')}</div>
                      ) : (
                        <div className="text-emerald-600 font-bold mt-0.5">Vô thời hạn</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(te)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/40"
                      >
                        <BookOpen className="h-3 w-3" />
                        {te.classes.length} lớp học
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(te)}
                          disabled={togglingId === te.teacherId}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            te.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                          } ${togglingId === te.teacherId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={te.isActive ? "Bấm để khóa tài khoản" : "Bấm để kích hoạt tài khoản"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              te.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold ${te.isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                          {te.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(te)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(te)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {te.isActive && (
                          <button
                            onClick={() => handleOpenDelete(te)}
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
                Hiển thị giáo viên từ <span className="font-bold text-gray-900">{((page - 1) * pageSize) + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(page * pageSize, totalCount)}
                </span>{' '}
                trong tổng số <span className="font-bold text-gray-900">{totalCount}</span> giáo viên
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

      {/* ── Dialog 1: Create Teacher Modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thêm giáo viên mới</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tạo tài khoản giáo viên chính thức hoặc giáo viên dự giờ</p>
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
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="VD: 0905123456"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
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
                <p className="text-[11px] text-amber-600 font-medium mt-1 leading-normal bg-amber-50/50 border border-amber-200/40 p-2.5 rounded-xl">
                  * Mật khẩu mặc định ban đầu là <strong className="text-amber-800">123456</strong>. Hệ thống sẽ bắt buộc giáo viên cập nhật mật khẩu mới ngay trong lần đăng nhập đầu tiên.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Loại giáo viên</label>
                  <CustomDropdown
                    value={form.type}
                    options={TYPE_OPTIONS}
                    onChange={(val: string) => setForm((p) => ({ ...p, type: val as 'permanent' | 'guest' }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu hợp đồng</label>
                  <Input
                    type="date"
                    value={form.contractStart}
                    onChange={(e) => setForm((p) => ({ ...p, contractStart: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày kết thúc (bỏ trống nếu vô hạn)</label>
                  <Input
                    type="date"
                    value={form.contractEnd}
                    onChange={(e) => setForm((p) => ({ ...p, contractEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Giới thiệu ngắn (Bio)</label>
                <textarea
                  placeholder="Ghi chú kinh nghiệm, chuyên môn..."
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:border-amber-500 focus:ring-amber-500/20 focus:outline-none min-h-[80px]"
                />
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

      {/* ── Dialog 2: Edit Teacher Modal ── */}
      {showEdit && selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Cập nhật thông tin giáo viên</h2>
                <p className="text-xs text-gray-400 mt-0.5">Sửa đổi thông tin tài khoản và cấu hình hợp đồng</p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
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
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="VD: 0905123456"
                    value={editForm.phone ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Loại giáo viên</label>
                  <CustomDropdown
                    value={editForm.type ?? 'permanent'}
                    options={TYPE_OPTIONS}
                    onChange={(val: string) => setEditForm((p) => ({ ...p, type: val as 'permanent' | 'guest' }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu hợp đồng</label>
                  <Input
                    type="date"
                    value={editForm.contractStart ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, contractStart: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ngày kết thúc (bỏ trống nếu vô hạn)</label>
                  <Input
                    type="date"
                    value={editForm.contractEnd ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, contractEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Giới thiệu ngắn (Bio)</label>
                <textarea
                  placeholder="Ghi chú kinh nghiệm, chuyên môn..."
                  value={editForm.bio ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:border-amber-500 focus:ring-amber-500/20 focus:outline-none min-h-[80px]"
                />
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

      {/* ── Dialog 3: Teacher Details Modal ── */}
      {showDetail && selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowDetail(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                  {selectedTeacher.fullName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug truncate">{selectedTeacher.fullName}</h2>
                  <p className="text-xs text-gray-500 leading-none mt-1 truncate">{selectedTeacher.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto overflow-x-hidden space-y-6 flex-1 min-h-0">
              {/* Profile Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200/60 pb-1.5">Thông tin liên hệ</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">{selectedTeacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium truncate">{selectedTeacher.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Ngày tham gia hệ thống: <span className="font-semibold text-gray-800">
                        {new Date(selectedTeacher.createdAt).toLocaleDateString('vi-VN')}
                      </span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200/60 pb-1.5">Hợp đồng & Trạng thái</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Loại giáo viên:</span>
                      <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                        selectedTeacher.type === 'guest'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/40'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/40'
                      }`}>
                        {selectedTeacher.type === 'guest' ? 'Dự giờ / Dạy thay' : 'Chính thức'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 text-xs">
                      <span>Thời hạn:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(selectedTeacher.contractStart).toLocaleDateString('vi-VN')}
                        {selectedTeacher.contractEnd ? ` - ${new Date(selectedTeacher.contractEnd).toLocaleDateString('vi-VN')}` : ' (Vô thời hạn)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Trạng thái:</span>
                      {selectedTeacher.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 border border-red-200 text-red-700">
                          Đã khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio section */}
              {selectedTeacher.bio && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200/60 pb-1.5">Giới thiệu bản thân</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedTeacher.bio}</p>
                </div>
              )}

              {/* Taught classes */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  Các lớp đang phụ trách ({selectedTeacher.classes.length})
                </h3>

                {selectedTeacher.classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    Chưa được phân công phụ trách lớp nào.
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {selectedTeacher.classes.map((cls) => (
                      <div key={cls.classId} className="p-3.5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{cls.className}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Chương trình: {cls.categoryName}</p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs text-gray-500 font-semibold">{cls.memberCount} học viên</span>
                          {cls.status === 'active' ? (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Active</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded bg-gray-50 border border-gray-200 text-gray-500">{cls.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialog 4: Lock Confirmation Modal ── */}
      {showDeleteConfirm && selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4 mx-auto">
              <AlertTriangle className="h-6 w-6 shrink-0" />
            </div>
            
            <h3 className="text-center font-bold text-lg text-gray-900 mb-2">Khóa tài khoản giáo viên?</h3>
            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn khóa tài khoản của giáo viên <strong className="text-gray-800">{selectedTeacher.fullName}</strong>? Giáo viên này sẽ không thể đăng nhập vào hệ thống nữa.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Quay lại
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl text-xs font-bold bg-red-500 border-red-600 hover:bg-red-600 text-white shadow-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Khóa tài khoản'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import {
  Users, Plus, Edit2, Trash2, Search, Phone, Mail,
  Calendar, Award, BookOpen, AlertTriangle, KeyRound, Briefcase,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  Dialog,
  DialogContent,
} from '@/shared/components/ui/dialog'
import {
  ScrollablePageLayout,
  PageHeader,
  Modal,
  EmptyState,
  LoadingState,
  SearchInput,
  Pagination,
  StatusBadge,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
} from '@/shared/components'
import {
  useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher
} from './useTeachers'
import type { CreateTeacherRequest, UpdateTeacherRequest, TeacherDetail } from './teachers.types'
import { toast } from '@/shared/utils/toast'
import { getApiErrorMessage } from '@/shared/utils/upload'

const TYPE_OPTIONS = [
  { id: 'permanent', name: 'Chính thức' },
  { id: 'guest', name: 'Dự giờ / Dạy thay' },
]

const STATUS_OPTIONS = [
  { id: 'active', name: 'Đang hoạt động' },
  { id: 'inactive', name: 'Đã khóa' },
]

const EMPTY_FORM: CreateTeacherRequest = {
  fullName: '',
  email: '',
  password: '123456',
  phone: '',
  type: 'permanent',
  bio: '',
  contractStart: new Date().toISOString().slice(0, 10),
  contractEnd: '',
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-r-xl border-l-4 border-red-500 bg-red-50 px-4 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
      <p className="text-[13px] font-medium text-red-700">{message}</p>
    </div>
  )
}

function getTeacherColumns(handlers: {
  onDetail: (t: TeacherDetail) => void
  onEdit: (t: TeacherDetail) => void
  onDelete: (t: TeacherDetail) => void
  onToggleActive: (t: TeacherDetail) => void
  togglingId: string | null
}): DataTableColumn<TeacherDetail>[] {
  return [
    {
      key: 'name',
      header: 'Giáo viên',
      className: 'px-6 py-4',
      headerClassName: 'px-6 py-4',
      render: (te) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200/50 bg-primary-50 font-bold text-primary-700">
            {te.fullName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-snug text-ink-900">{te.fullName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      className: 'px-6 py-4 font-medium text-muted-foreground',
      headerClassName: 'px-6 py-4',
      render: (te) => te.phone,
    },
    {
      key: 'type',
      header: 'Phân loại',
      className: 'px-6 py-4',
      headerClassName: 'px-6 py-4',
      render: (te) =>
        te.type === 'guest' ? (
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            Dự giờ / Dạy thay
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            Chính thức
          </span>
        ),
    },
    {
      key: 'contract',
      header: 'Thời hạn hợp đồng',
      className: 'px-6 py-4 text-xs font-medium text-muted-foreground',
      headerClassName: 'px-6 py-4',
      render: (te) => (
        <div>
          <div>Từ: {new Date(te.contractStart).toLocaleDateString('vi-VN')}</div>
          {te.contractEnd ? (
            <div className="mt-0.5 text-muted-foreground">Đến: {new Date(te.contractEnd).toLocaleDateString('vi-VN')}</div>
          ) : (
            <div className="mt-0.5 font-bold text-emerald-600">Vô thời hạn</div>
          )}
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Lớp phụ trách',
      className: 'px-6 py-4',
      headerClassName: 'px-6 py-4',
      render: (te) => (
        <button
          type="button"
          onClick={() => handlers.onDetail(te)}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-primary-200/40 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <BookOpen className="h-3 w-3" />
          {te.classes.length} lớp học
        </button>
      ),
    },
    {
      key: 'active',
      header: 'Kích hoạt',
      className: 'px-6 py-4',
      headerClassName: 'px-6 py-4',
      render: (te) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlers.onToggleActive(te)}
            disabled={handlers.togglingId === te.teacherId}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              te.isActive ? 'bg-emerald-500' : 'bg-gray-200'
            } ${handlers.togglingId === te.teacherId ? 'cursor-not-allowed opacity-50' : ''}`}
            title={te.isActive ? 'Bấm để khóa tài khoản' : 'Bấm để kích hoạt tài khoản'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                te.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${te.isActive ? 'text-emerald-700' : 'text-red-700'}`}>
            {te.isActive ? 'Hoạt động' : 'Bị khóa'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'px-6 py-4 text-right',
      headerClassName: 'px-6 py-4 text-right',
      render: (te) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handlers.onDetail(te)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground"
            title="Xem chi tiết"
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handlers.onEdit(te)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground"
            title="Chỉnh sửa"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {te.isActive && (
            <button
              type="button"
              onClick={() => handlers.onDelete(te)}
              className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Khóa tài khoản"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]
}

export default function TeachersPage() {
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(null)
  const [form, setForm] = useState<CreateTeacherRequest>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<UpdateTeacherRequest>({})
  const [errorMsg, setErrorMsg] = useState('')

  const { data, isLoading } = useTeachers({
    search,
    type: typeFilter,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
    pageSize,
  })

  const teachers = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { mutate: createTeacher, isPending: creating } = useCreateTeacher()
  const { mutate: updateTeacher, isPending: updating } = useUpdateTeacher()
  const { mutate: deleteTeacher, isPending: deleting } = useDeleteTeacher()

  const hasFilters = !!(search || typeFilter || statusFilter || searchVal)

  const resetFilters = () => {
    setSearchVal('')
    setSearch('')
    setTypeFilter('')
    setStatusFilter('')
    setPage(1)
  }

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
      password: '',
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
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setErrorMsg(msg || 'Tạo tài khoản giáo viên thất bại')
      },
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

    updateTeacher(
      { id: selectedTeacher.teacherId, body: payload },
      {
        onSuccess: () => {
          setShowEdit(false)
          setSelectedTeacher(null)
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          setErrorMsg(msg || 'Cập nhật tài khoản thất bại')
        },
      }
    )
  }

  const handleToggleActive = (teacher: TeacherDetail) => {
    setTogglingId(teacher.teacherId)
    updateTeacher(
      {
        id: teacher.teacherId,
        body: { isActive: !teacher.isActive },
      },
      {
        onSuccess: () => setTogglingId(null),
        onError: () => setTogglingId(null),
      }
    )
  }

  const handleDelete = () => {
    if (!selectedTeacher) return
    deleteTeacher(selectedTeacher.teacherId, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        setSelectedTeacher(null)
        toast.success('Khóa tài khoản giáo viên thành công')
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, 'Khóa tài khoản giáo viên thất bại'))
      },
    })
  }

  const columns = getTeacherColumns({
    onDetail: handleOpenDetail,
    onEdit: handleOpenEdit,
    onDelete: handleOpenDelete,
    onToggleActive: handleToggleActive,
    togglingId,
  })

  return (
    <>
    <ScrollablePageLayout
      header={
        <>
      <PageHeader
        eyebrow="Quản lý"
        title="Giáo viên"
        icon={Briefcase}
        actions={
          <Button onClick={handleOpenCreate} className="gap-1.5 rounded text-xs font-bold">
            <Plus className="h-4 w-4" />
            Thêm giáo viên mới
          </Button>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(searchVal)
          setPage(1)
        }}
        className="flex flex-col gap-3 rounded-[8px] border border-border bg-background p-4 shadow-sm xl:flex-row"
      >
        <div className="flex flex-1 gap-2">
          <SearchInput
            placeholder="Tìm theo tên giáo viên, email, số điện thoại..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onClear={() => setSearchVal('')}
          />
          <Button type="submit" className="h-9 shrink-0 gap-1 rounded px-4 text-xs font-bold shadow-sm">
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="w-44">
            <CustomDropdown
              value={typeFilter}
              options={[{ id: '', name: 'Tất cả loại hình' }, ...TYPE_OPTIONS]}
              onChange={(val) => { setTypeFilter(val); setPage(1) }}
            />
          </div>

          <div className="w-40">
            <CustomDropdown
              value={statusFilter}
              options={[{ id: '', name: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]}
              onChange={(val) => { setStatusFilter(val); setPage(1) }}
            />
          </div>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="h-9 rounded-[8px] border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-ink-900"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </form>
        </>
      }
    >
      {isLoading ? (
        <LoadingState variant="skeleton-table" />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy giáo viên nào phù hợp"
          description="Vui lòng thay đổi từ khóa tìm kiếm hoặc chỉnh lại các bộ lọc"
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters} className="rounded text-xs font-bold">
                Xóa bộ lọc
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col overflow-hidden">
          <DataTable columns={columns} data={teachers} keyExtractor={(te) => te.teacherId} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="giáo viên"
            bordered
          />
        </div>
      )}

    </ScrollablePageLayout>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Thêm giáo viên mới"
        description="Tạo tài khoản giáo viên chính thức hoặc giáo viên dự giờ"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowCreate(false)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="create-teacher-form" className="flex-1 text-xs font-bold" loading={creating}>
              Tạo tài khoản
            </Button>
          </>
        }
      >
        <form id="create-teacher-form" onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
 <label className="text-sm ">Họ và tên <span className="text-red-500">*</span></label>
            <Input
              placeholder="VD: Nguyễn Văn A"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Email đăng nhập <span className="text-red-500">*</span></label>
              <Input
                type="email"
                placeholder="VD: user1@gmail.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
 <label className="text-sm ">
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
 <label className="flex items-center gap-1 text-sm ">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              Mật khẩu khởi tạo <span className="text-red-500">*</span>
            </label>
            <Input type="text" value={form.password} readOnly className="cursor-not-allowed select-none bg-muted font-mono text-muted-foreground" />
            <p className="mt-1 rounded-[8px] border border-primary-200/40 bg-primary-50/50 p-2.5 text-xs font-medium leading-normal text-primary-600">
              * Mật khẩu mặc định ban đầu là <strong className="text-primary-800">123456</strong>. Hệ thống sẽ bắt buộc giáo viên cập nhật mật khẩu mới ngay trong lần đăng nhập đầu tiên.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Loại giáo viên</label>
              <CustomDropdown
                value={form.type}
                options={TYPE_OPTIONS}
                onChange={(val) => setForm((p) => ({ ...p, type: val as 'permanent' | 'guest' }))}
              />
            </div>
            <div className="space-y-1.5">
 <label className="text-sm ">Ngày bắt đầu hợp đồng</label>
              <Input
                type="date"
                value={form.contractStart}
                onChange={(e) => setForm((p) => ({ ...p, contractStart: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Ngày kết thúc (bỏ trống nếu vô hạn)</label>
              <Input
                type="date"
                value={form.contractEnd}
                onChange={(e) => setForm((p) => ({ ...p, contractEnd: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
 <label className="text-sm ">Giới thiệu ngắn (Bio)</label>
            <textarea
              placeholder="Ghi chú kinh nghiệm, chuyên môn..."
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="min-h-[80px] w-full rounded-[8px] border border-border p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500/20"
            />
          </div>

          {errorMsg && <ErrorAlert message={errorMsg} />}
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={showEdit && !!selectedTeacher}
        onOpenChange={(open) => { setShowEdit(open); if (!open) setSelectedTeacher(null) }}
        title="Cập nhật thông tin giáo viên"
        description="Sửa đổi thông tin tài khoản và cấu hình hợp đồng"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowEdit(false)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="edit-teacher-form" className="flex-1 text-xs font-bold" loading={updating}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <form id="edit-teacher-form" onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
 <label className="text-sm ">Họ và tên <span className="text-red-500">*</span></label>
            <Input
              placeholder="VD: Nguyễn Văn A"
              value={editForm.fullName ?? ''}
              onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Email đăng nhập <span className="text-red-500">*</span></label>
              <Input
                type="email"
                placeholder="VD: user1@gmail.com"
                value={editForm.email ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
 <label className="text-sm ">
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
 <label className="flex items-center gap-1.5 text-sm ">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              Đổi mật khẩu (bỏ trống nếu giữ nguyên)
            </label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={editForm.password ?? ''}
              onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Loại giáo viên</label>
              <CustomDropdown
                value={editForm.type ?? 'permanent'}
                options={TYPE_OPTIONS}
                onChange={(val) => setEditForm((p) => ({ ...p, type: val as 'permanent' | 'guest' }))}
              />
            </div>
            <div className="space-y-1.5">
 <label className="text-sm ">Ngày bắt đầu hợp đồng</label>
              <Input
                type="date"
                value={editForm.contractStart ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, contractStart: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
 <label className="text-sm ">Ngày kết thúc (bỏ trống nếu vô hạn)</label>
              <Input
                type="date"
                value={editForm.contractEnd ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, contractEnd: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
 <label className="text-sm ">Giới thiệu ngắn (Bio)</label>
            <textarea
              placeholder="Ghi chú kinh nghiệm, chuyên môn..."
              value={editForm.bio ?? ''}
              onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
              className="min-h-[80px] w-full rounded-[8px] border border-border p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500/20"
            />
          </div>

          <div className="mt-2 flex items-center justify-between rounded-[8px] border border-border/60 bg-muted p-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Trạng thái kích hoạt tài khoản</span>
              <span className="mt-0.5 text-xs text-muted-foreground">Tài khoản bị khóa sẽ không thể đăng nhập hệ thống</span>
            </div>
            <input
              type="checkbox"
              checked={editForm.isActive ?? false}
              onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-primary-500 focus:ring-primary-500"
            />
          </div>

          {errorMsg && <ErrorAlert message={errorMsg} />}
        </form>
      </Modal>

      {/* Teacher Detail Modal */}
      <Dialog open={showDetail && !!selectedTeacher} onOpenChange={setShowDetail}>
        <DialogContent className="max-h-[85vh] max-w-2xl gap-0 p-0">
          {selectedTeacher && (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-lg font-bold text-primary-700">
                    {selectedTeacher.fullName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold leading-snug text-ink-900">{selectedTeacher.fullName}</h2>
                    <p className="mt-1 truncate text-xs leading-none text-muted-foreground">{selectedTeacher.email}</p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2.5 rounded-[8px] border border-border bg-muted p-4">
                    <h3 className="border-b border-border/60 pb-1.5 text-xs font-bold uppercase tracking-wider text-ink-900">Thông tin liên hệ</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{selectedTeacher.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{selectedTeacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          Ngày tham gia hệ thống:{' '}
                          <span className="font-semibold text-foreground">
                            {new Date(selectedTeacher.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 rounded-[8px] border border-border bg-muted p-4">
                    <h3 className="border-b border-border/60 pb-1.5 text-xs font-bold uppercase tracking-wider text-ink-900">Hợp đồng & Trạng thái</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Loại giáo viên:</span>
                        <span
                          className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                            selectedTeacher.type === 'guest'
                              ? 'border border-purple-200/40 bg-purple-50 text-purple-700'
                              : 'border border-blue-200/40 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {selectedTeacher.type === 'guest' ? 'Dự giờ / Dạy thay' : 'Chính thức'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Thời hạn:</span>
                        <span className="font-semibold text-foreground">
                          {new Date(selectedTeacher.contractStart).toLocaleDateString('vi-VN')}
                          {selectedTeacher.contractEnd
                            ? ` - ${new Date(selectedTeacher.contractEnd).toLocaleDateString('vi-VN')}`
                            : ' (Vô thời hạn)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Trạng thái:</span>
                        <StatusBadge
                          status={selectedTeacher.isActive ? 'active' : 'inactive'}
                          label={selectedTeacher.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTeacher.bio && (
                  <div className="space-y-2 rounded-[8px] border border-border bg-muted p-4">
                    <h3 className="border-b border-border/60 pb-1.5 text-xs font-bold uppercase tracking-wider text-ink-900">Giới thiệu bản thân</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{selectedTeacher.bio}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                    <Award className="h-4 w-4 text-primary-500" />
                    Các lớp đang phụ trách ({selectedTeacher.classes.length})
                  </h3>

                  {selectedTeacher.classes.length === 0 ? (
                    <div className="rounded-[8px] border border-dashed border-border bg-muted/50 py-8 text-center text-xs text-muted-foreground">
                      Chưa được phân công phụ trách lớp nào.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-[8px] border border-border">
                      {selectedTeacher.classes.map((cls) => (
                        <div key={cls.classId} className="flex items-center justify-between gap-3 p-3.5 text-sm transition-colors hover:bg-muted/50">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900">{cls.className}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Chương trình: {cls.categoryName}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <span className="text-xs font-semibold text-muted-foreground">{cls.memberCount} học viên</span>
                            <StatusBadge
                              status={cls.status as 'active' | 'paused' | 'ended'}
                              label={cls.status === 'active' ? 'Active' : cls.status}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm && !!selectedTeacher}
        onOpenChange={setShowDeleteConfirm}
        title="Khóa tài khoản giáo viên?"
        description={
          <>
            Bạn có chắc chắn muốn khóa tài khoản của giáo viên{' '}
            <strong className="text-foreground">{selectedTeacher?.fullName}</strong>? Giáo viên này sẽ không thể đăng nhập vào hệ thống nữa.
          </>
        }
        cancelLabel="Quay lại"
        confirmLabel="Khóa tài khoản"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />
    </>
  )
}

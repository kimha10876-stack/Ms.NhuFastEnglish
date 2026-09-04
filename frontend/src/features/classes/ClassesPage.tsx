import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Clock, BookOpen, ChevronRight, Search, MapPin, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { useAuthStore } from '@/features/auth/auth.store'
import { useClasses, useCreateClass, useClassCategories } from './useClasses'
import type { CreateClassRequest, ClassSummary } from './classes.types'
import { cn } from '@/shared/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import {
  PageLayout,
  ScrollablePageLayout,
  PageHeader,
  EmptyState,
  LoadingState,
  SearchInput,
  Pagination,
  StatusBadge,
  DataTable,
  type DataTableColumn,
} from '@/shared/components'
import { CreateClassModal } from './components/class-list/CreateClassModal'

const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended: 'Đã kết thúc',
}

type ClassViewMode = 'card' | 'list'

function getClassTableColumns(onNavigate: (id: string) => void): DataTableColumn<ClassSummary>[] {
  return [
    {
      key: 'name',
      header: 'Lớp học',
      className: 'px-4 py-3',
      headerClassName: 'px-4 py-2.5',
      render: (cls) => (
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: cls.categoryColorHex }}
            >
              {cls.categoryName}
            </span>
          </div>
          <p className="line-clamp-1 text-sm font-semibold text-ink-900">{cls.name}</p>
          {cls.room && <p className="mt-0.5 text-xs text-muted-foreground">Phòng: {cls.room}</p>}
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      className: 'px-4 py-3 text-sm text-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (cls) => cls.teacherName,
    },
    {
      key: 'members',
      header: 'Học viên',
      className: 'whitespace-nowrap px-4 py-3 text-sm text-muted-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (cls) => (
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {cls.memberCount}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Lịch học',
      className: 'max-w-[180px] px-4 py-3 text-xs text-muted-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (cls) =>
        cls.scheduleDays
          ? `${cls.scheduleDays}${cls.scheduleTime ? ` · ${cls.scheduleTime}` : ''}`
          : 'Chưa cập nhật',
    },
    {
      key: 'fee',
      header: 'Học phí',
      className: 'whitespace-nowrap px-4 py-3 text-xs font-semibold text-primary-700',
      headerClassName: 'px-4 py-2.5',
      render: (cls) =>
        cls.monthlyFee > 0
          ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng`
          : '—',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'whitespace-nowrap px-4 py-3',
      headerClassName: 'px-4 py-2.5',
      render: (cls) => (
        <StatusBadge status={cls.status} label={STATUS_LABEL[cls.status] ?? cls.status} />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'px-4 py-3 text-right',
      headerClassName: 'px-4 py-2.5 text-right',
      render: (cls) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(cls.id)
          }}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary-600"
          title="Xem chi tiết lớp"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ]
}

function renderClassCard(cls: ClassSummary, onNavigate: (id: string) => void) {
  return (
    <button
      key={cls.id}
      type="button"
      onClick={() => onNavigate(cls.id)}
      className="group rounded border border-border bg-background p-5 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide text-white"
          style={{ backgroundColor: cls.categoryColorHex }}
        >
          {cls.categoryName}
        </span>
        <StatusBadge status={cls.status} label={STATUS_LABEL[cls.status] ?? cls.status} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="mb-0.5 text-[15px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-primary-700">
          {cls.name}
        </h3>
        {cls.monthlyFee > 0 && (
          <span className="shrink-0 rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-extrabold text-primary-700">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{cls.teacherName}</p>

      <div className="flex items-end justify-between">
        <div className="flex flex-wrap gap-2.5 text-xs text-muted-foreground">
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
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-primary-400" />
      </div>
    </button>
  )
}

const EMPTY_FORM: CreateClassRequest = {
  name: '',
  categoryId: 1,
  teacherId: '',
  startDate: new Date().toISOString().slice(0, 10),
  monthlyFee: 0,
  scheduleDays: '',
  scheduleTime: '',
  room: '',
  note: '',
  maxStudents: undefined,
}

export default function ClassesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.roles.includes('Admin') ?? false
  const isStudent = user?.roles.includes('Student') ?? false

  const [studentPage, setStudentPage] = useState(1)
  const studentPageSize = 9

  const { data: myClassesData, isLoading: loadingMyClasses } = useQuery<any[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<any[]>>('/classes/my-classes').then((r) => r.data.data!),
    enabled: isStudent,
  })

  // Admin/Teacher state
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateClassRequest>({
    ...EMPTY_FORM,
    teacherId: isAdmin ? '' : (user?.id ?? ''),
  })
  const [formError, setFormError] = useState('')

  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [viewMode, setViewMode] = useState<ClassViewMode>('card')
  const [page, setPage] = useState(1)
  const pageSize = 9

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

  const { data: apiCategories = [] } = useClassCategories()
  const { mutate: create, isPending } = useCreateClass()

  // --- STUDENT VIEW ---
  if (isStudent) {
    const studentClasses = (myClassesData ?? []).filter((cls) => cls.status === 'active')
    const totalStudentCount = studentClasses.length
    const totalStudentPages = Math.ceil(totalStudentCount / studentPageSize) || 1
    const activeStudentPage = Math.min(studentPage, totalStudentPages)
    const paginatedStudentClasses = studentClasses.slice(
      (activeStudentPage - 1) * studentPageSize,
      activeStudentPage * studentPageSize
    )

    return (
      <PageLayout>
<PageHeader
          eyebrow="Học tập"
          title="Lớp học của tôi"
          icon={BookOpen}
        />

        {loadingMyClasses ? (
          <LoadingState variant="spinner" />
        ) : studentClasses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa tham gia lớp học nào"
            description="Bạn chưa có danh sách lớp học nào trên hệ thống. Hãy liên hệ với phòng tuyển sinh hoặc dùng link mời tham gia lớp học để đăng ký."
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 animate-in fade-in duration-200">
              {paginatedStudentClasses.map((cls) => (
                <div
                  key={cls.classId}
                  onClick={() => navigate(`/classes/${cls.classId}`)}
                  className="group flex cursor-pointer flex-col gap-4 rounded border border-border bg-background p-5 shadow-sm transition-all hover:border-primary-400 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: cls.categoryColorHex || '#6B7280' }}
                    >
                      {cls.categoryName}
                    </span>
                    <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Đang tham gia
                    </span>
                  </div>

                  <div>
                    <h3 className="line-clamp-1 text-base font-bold leading-snug text-ink-900 transition-colors group-hover:text-primary-600">
                      {cls.className}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      Giảng viên: <strong className="font-semibold text-foreground">{cls.teacherName}</strong>
                    </p>
                  </div>

                  <div className="mt-auto space-y-2 border-t border-gray-50 pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      Lịch học: {cls.scheduleDays || 'Chưa cập nhật'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      Thời gian: {cls.scheduleTime || 'Chưa cập nhật'}
                    </div>
                    {cls.room && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        Phòng học: {cls.room}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-0.5 pt-2 text-xs font-bold text-primary-600 transition-colors group-hover:text-primary-700">
                    Vào lớp học
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={activeStudentPage}
              totalPages={totalStudentPages}
              totalCount={totalStudentCount}
              pageSize={studentPageSize}
              onPageChange={setStudentPage}
              itemLabel="lớp"
              bordered
            />
          </div>
        )}
      </PageLayout>
    )
  }

  // --- ADMIN / TEACHER VIEW ---
  const openCreateModal = () => {
    setForm({
      ...EMPTY_FORM,
      categoryId: apiCategories[0]?.id || 1,
      teacherId: isAdmin ? '' : (user?.id ?? ''),
    })
    setFormError('')
    setShowCreate(true)
  }

  const setField = (field: keyof CreateClassRequest) =>
    (e: { target: { value: string } }) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.teacherId.trim()) {
      setFormError('Vui lòng chọn giáo viên phụ trách')
      return
    }
    create(
      {
        ...form,
        categoryId: Number(form.categoryId),
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

  const hasFilters = !!(search || selectedCategory !== undefined || selectedStatus || searchVal)

  const resetFilters = () => {
    setSearchVal('')
    setSearch('')
    setSelectedCategory(undefined)
    setSelectedStatus('')
    setPage(1)
  }

  const classTableColumns = getClassTableColumns((id) => navigate(`/classes/${id}`))

  return (
    <>
    <ScrollablePageLayout
      header={
        <>
      <PageHeader
        eyebrow={isAdmin ? 'Quản lý hệ thống' : 'Giảng dạy'}
        title={isAdmin ? 'Danh sách Lớp học' : 'Lớp học phụ trách'}
        actions={
          <Button onClick={openCreateModal} className="gap-1.5 rounded text-xs font-bold">
            <Plus className="h-4 w-4" />
            Tạo lớp mới
          </Button>
        }
      />

      {/* Filter Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(searchVal)
          setPage(1)
        }}
        className="flex flex-col gap-3 rounded border border-border bg-background p-4 shadow-sm xl:flex-row xl:items-center"
      >
        <div className="flex min-w-0 flex-1 gap-2">
          <SearchInput
            placeholder="Tìm theo tên lớp, phòng học, ghi chú..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onClear={() => setSearchVal('')}
          />
          <Button type="submit" className="h-9 shrink-0 gap-1 rounded px-4 text-xs font-bold shadow-sm">
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </Button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex items-center rounded border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors',
                viewMode === 'card'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Xem dạng thẻ"
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Xem dạng bảng"
              title="Xem dạng bảng"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="w-44 shrink-0 md:w-48">
            <CustomDropdown
              value={selectedCategory ?? 'all'}
              options={[
                { id: 'all', name: 'Tất cả danh mục' },
                ...apiCategories.map((c) => ({ id: c.id, name: c.name })),
              ]}
              onChange={(val) => {
                setSelectedCategory(val === 'all' ? undefined : Number(val))
                setPage(1)
              }}
            />
          </div>

          <div className="w-40 shrink-0 md:w-48">
            <CustomDropdown
              value={selectedStatus}
              options={[
                { id: '', name: 'Tất cả trạng thái' },
                { id: 'active', name: 'Đang hoạt động' },
                { id: 'paused', name: 'Tạm dừng' },
                { id: 'ended', name: 'Đã kết thúc' },
              ]}
              onChange={(val) => {
                setSelectedStatus(val)
                setPage(1)
              }}
            />
          </div>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="h-9 shrink-0 rounded border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-ink-900"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </form>
        </>
      }
    >

      {/* Grid Content */}
      {isLoading ? (
        <LoadingState variant={viewMode === 'card' ? 'skeleton-cards' : 'skeleton-table'} rows={6} />
      ) : totalCount === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={Search}
            title="Không tìm thấy lớp học nào phù hợp"
            description="Vui lòng thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn"
            action={
              <Button variant="outline" size="sm" onClick={resetFilters} className="rounded text-xs font-bold">
                Xóa bộ lọc
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Chưa có lớp học nào"
            description="Tạo lớp đầu tiên để bắt đầu quản lý học viên"
            action={
              <Button onClick={openCreateModal} className="rounded text-xs font-bold">
                <Plus className="h-4 w-4" />
                Tạo lớp học
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-6">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classes.map((cls) => renderClassCard(cls, (id) => navigate(`/classes/${id}`)))}
            </div>
          ) : (
            <DataTable
              columns={classTableColumns}
              data={classes}
              keyExtractor={(cls) => cls.id}
              onRowClick={(cls) => navigate(`/classes/${cls.id}`)}
            />
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="lớp"
            bordered
          />
        </div>
      )}

    </ScrollablePageLayout>

      {/* Create Class Modal */}
      <CreateClassModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        form={form}
        setForm={setForm}
        setField={setField}
        apiCategories={apiCategories}
        isAdmin={isAdmin}
        formError={formError}
        handleCreate={handleCreate}
        isPending={isPending}
      />
    </>
  )
}

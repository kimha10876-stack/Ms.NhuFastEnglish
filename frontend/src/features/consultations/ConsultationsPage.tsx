import { useState } from 'react'
import {
  MessageSquare, Trash2, Edit2, Phone, Mail, Clock, Info
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useAdminConsultations, useUpdateConsultation, useDeleteConsultation
} from './useConsultation'
import type { ConsultationRequest, ConsultationStatus } from './consultation.types'
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

const STATUS_FILTER_OPTIONS = [
  { id: 'all', name: 'Tất cả trạng thái' },
  { id: 'new', name: 'Yêu cầu mới' },
  { id: 'contacted', name: 'Đã liên hệ' },
  { id: 'enrolled', name: 'Đã nhập học' },
  { id: 'rejected', name: 'Đã từ chối' },
]

const STATUS_EDIT_OPTIONS = [
  { id: 'new', name: 'Yêu cầu mới' },
  { id: 'contacted', name: 'Đã liên hệ' },
  { id: 'enrolled', name: 'Đã nhập học' },
  { id: 'rejected', name: 'Đã từ chối' },
]

function getConsultationColumns(handlers: {
  onOpenDetail: (req: ConsultationRequest) => void
  onOpenDelete: (req: ConsultationRequest, e: React.MouseEvent) => void
}): DataTableColumn<ConsultationRequest>[] {
  return [
    {
      key: 'fullName',
      header: 'Họ và tên',
      className: 'px-5 py-3.5 font-bold text-ink-900',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) => (
        <div className="flex items-center gap-2">
          {req.fullName}
          {req.requestCount > 1 && (
            <span className="whitespace-nowrap rounded-[8px] border border-red-100 bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
              {req.requestCount} lần yêu cầu
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      className: 'px-5 py-3.5 font-medium text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) => (
        <span className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {req.phone}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      className: 'px-5 py-3.5 text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) =>
        req.email ? (
          <span className="flex items-center gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {req.email}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground">-</span>
        ),
    },
    {
      key: 'message',
      header: 'Mục tiêu học',
      className: 'max-w-[200px] truncate px-5 py-3.5 text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) =>
        req.message ? (
          <span title={req.message}>{req.message}</span>
        ) : (
          <span className="text-xs italic text-muted-foreground">Chưa cung cấp</span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'px-5 py-3.5',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) => <StatusBadge status={req.status} />,
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      className: 'px-5 py-3.5 text-xs font-medium text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (req) =>
        new Date(req.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'actions',
      header: 'Hành động',
      className: 'w-[120px] px-5 py-3.5 text-center',
      headerClassName: 'w-[120px] px-5 py-3 text-center',
      render: (req) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlers.onOpenDetail(req)
            }}
            className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary-50 hover:text-primary-600"
            title="Cập nhật trạng thái"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => handlers.onOpenDelete(req, e)}
            className="rounded p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600"
            title="Xoá yêu cầu"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]
}

export default function ConsultationsPage() {
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null)

  const [editStatus, setEditStatus] = useState<ConsultationStatus>('new')
  const [editAdminNote, setEditAdminNote] = useState('')

  const { data, isLoading } = useAdminConsultations({
    search,
    status: statusFilter,
    page,
    pageSize,
  })

  const { mutate: updateConsultation, isPending: updating } = useUpdateConsultation()
  const { mutate: deleteConsultation, isPending: deleting } = useDeleteConsultation()

  const requests = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchVal)
    setPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleOpenDetail = (req: ConsultationRequest) => {
    setSelectedRequest(req)
    setEditStatus(req.status)
    setEditAdminNote(req.adminNote ?? '')
    setShowDetail(true)
  }

  const handleOpenDelete = (req: ConsultationRequest, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRequest(req)
    setShowDeleteConfirm(true)
  }

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    updateConsultation(
      {
        id: selectedRequest.id,
        body: {
          status: editStatus,
          adminNote: editAdminNote,
        },
      },
      {
        onSuccess: () => {
          setShowDetail(false)
        },
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedRequest) return
    deleteConsultation(selectedRequest.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
      },
    })
  }

  const columns = getConsultationColumns({
    onOpenDetail: handleOpenDetail,
    onOpenDelete: handleOpenDelete,
  })

  const hasFilters = !!(search || (statusFilter && statusFilter !== 'all') || searchVal)

  const resetFilters = () => {
    setSearchVal('')
    setSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <>
    <ScrollablePageLayout
      header={
        <>
      <PageHeader
        title="Quản lý yêu cầu tư vấn"
        icon={MessageSquare}
        description={`Tổng số yêu cầu nhận được: ${totalCount} yêu cầu.`}
      />

      {/* Filter Bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-[8px] border border-border bg-background p-4 shadow-sm md:flex-row">
        <form onSubmit={handleSearchSubmit} className="flex w-full flex-1 gap-2 md:max-w-md">
          <SearchInput
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onClear={() => setSearchVal('')}
          />
          <Button type="submit" size="sm" className="h-9 font-semibold">
            Tìm kiếm
          </Button>
        </form>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">Trạng thái:</span>
          <div className="w-full md:w-[180px]">
            <CustomDropdown
              value={statusFilter}
              options={STATUS_FILTER_OPTIONS}
              onChange={handleStatusFilterChange}
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
      </div>
        </>
      }
    >

      {/* Table / Loading / Empty */}
      {isLoading ? (
        <LoadingState variant="skeleton-table" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Info}
          title="Không tìm thấy yêu cầu tư vấn nào"
          description="Không có thông tin đăng ký tư vấn nào khớp với bộ lọc hiện tại của bạn."
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
          <DataTable
            columns={columns}
            data={requests}
            keyExtractor={(req) => req.id}
            onRowClick={handleOpenDetail}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="yêu cầu"
            bordered
          />
        </div>
      )}

    </ScrollablePageLayout>

      {/* Detail & Update Modal */}
      <Modal
        open={showDetail && !!selectedRequest}
        onOpenChange={setShowDetail}
        title="Chi tiết yêu cầu tư vấn"
        description="Xem nội dung đăng ký và cập nhật tiến độ xử lý"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowDetail(false)}>
              Đóng lại
            </Button>
            <Button type="submit" form="edit-consultation-form" className="flex-1 text-xs font-bold" loading={updating}>
              Lưu cập nhật
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <form id="edit-consultation-form" onSubmit={handleSaveStatus} className="space-y-5">
            <div className="space-y-2.5 rounded-[8px] border border-border bg-muted p-4 text-sm text-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Học viên</span>
                  <strong className="flex items-center gap-2 text-base font-bold text-ink-900">
                    {selectedRequest.fullName}
                    {selectedRequest.requestCount > 1 && (
                      <span className="whitespace-nowrap rounded-[8px] border border-red-100 bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                        Yêu cầu {selectedRequest.requestCount} lần
                      </span>
                    )}
                  </strong>
                </div>
                <div>
                  <span className="block text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày gửi</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-1">
                <div>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3 w-3" /> Số điện thoại
                  </span>
                  <a href={`tel:${selectedRequest.phone}`} className="mt-0.5 block text-sm font-semibold text-primary-600 hover:underline">
                    {selectedRequest.phone}
                  </a>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <span className="mt-0.5 block break-all text-sm font-medium text-foreground">
                    {selectedRequest.email || <span className="text-xs font-normal italic text-muted-foreground">Chưa cung cấp</span>}
                  </span>
                </div>
              </div>

              {selectedRequest.contactedAt && (
                <div className="flex items-center gap-1.5 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Liên hệ lúc:{' '}
                    <strong>
                      {new Date(selectedRequest.contactedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mục tiêu học tập hoặc ghi chú của học viên:</span>
              <div className="rounded-[8px] border border-primary-100 bg-primary-50/50 p-3.5 text-sm italic leading-relaxed text-foreground whitespace-pre-wrap">
                {selectedRequest.message || 'Không có ghi chú cụ thể.'}
              </div>
            </div>

            <div className="space-y-1.5">
 <label className="text-xs uppercase tracking-wider">
                Cập nhật Trạng thái xử lý <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <CustomDropdown
                  value={editStatus}
                  options={STATUS_EDIT_OPTIONS}
                  onChange={(val) => setEditStatus(val as ConsultationStatus)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
 <label className="text-xs uppercase tracking-wider">
                Ghi chú của trung tâm (Kết quả tư vấn, lịch hẹn...)
              </label>
              <textarea
                rows={4}
                placeholder="Nhập ghi chú liên hệ chi tiết tại đây để theo dõi..."
                value={editAdminNote}
                onChange={(e) => setEditAdminNote(e.target.value)}
                className="w-full resize-none rounded-[8px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm && !!selectedRequest}
        onOpenChange={setShowDeleteConfirm}
        title="Xác nhận xoá yêu cầu?"
        description={
          <>
            Bạn có chắc chắn muốn xoá yêu cầu tư vấn học tập của học viên{' '}
            <strong className="text-ink-900">{selectedRequest?.fullName}</strong> ({selectedRequest?.phone})?
            Hành động này không thể hoàn tác.
          </>
        }
        cancelLabel="Huỷ bỏ"
        confirmLabel="Đồng ý xoá"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        variant="destructive"
      />
    </>
  )
}

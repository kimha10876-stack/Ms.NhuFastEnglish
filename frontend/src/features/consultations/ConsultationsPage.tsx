import { useState } from 'react'
import {
  MessageSquare, Search, Trash2, Edit2, Phone, Mail, Clock,
  AlertCircle, ChevronLeft, ChevronRight, Loader2, Info
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useAdminConsultations, useUpdateConsultation, useDeleteConsultation
} from './useConsultation'
import type { ConsultationRequest, ConsultationStatus } from './consultation.types'

const STATUS_FILTER_OPTIONS = [
  { id: 'all', name: 'Tất cả trạng thái' },
  { id: 'new', name: 'Yêu cầu mới' },
  { id: 'contacted', name: 'Đã liên hệ' },
  { id: 'enrolled', name: 'Đã nhập học' },
  { id: 'rejected', name: 'Đã từ chối' }
]

const STATUS_EDIT_OPTIONS = [
  { id: 'new', name: 'Yêu cầu mới' },
  { id: 'contacted', name: 'Đã liên hệ' },
  { id: 'enrolled', name: 'Đã nhập học' },
  { id: 'rejected', name: 'Đã từ chối' }
]

export default function ConsultationsPage() {
  const [searchVal, setSearchVal] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modals state
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null)
  
  // Edit form state
  const [editStatus, setEditStatus] = useState<ConsultationStatus>('new')
  const [editAdminNote, setEditAdminNote] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useAdminConsultations({
    search,
    status: statusFilter,
    page,
    pageSize
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
          adminNote: editAdminNote
        }
      },
      {
        onSuccess: () => {
          setShowDetail(false)
        }
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!selectedRequest) return
    deleteConsultation(selectedRequest.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
      }
    })
  }

  // Get status badge UI
  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Yêu cầu mới
          </span>
        )
      case 'contacted':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Đã liên hệ
          </span>
        )
      case 'enrolled':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Đã nhập học
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">
            Từ chối
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý yêu cầu tư vấn</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng số yêu cầu nhận được: <strong className="text-gray-700">{totalCount}</strong> yêu cầu.
          </p>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="pl-9 h-[38px] text-sm"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="h-[38px] font-semibold">
            Tìm kiếm
          </Button>
        </form>

        <div className="flex w-full md:w-auto gap-3 items-center">
          <span className="text-xs text-gray-500 font-semibold shrink-0">Trạng thái:</span>
          <div className="w-full md:w-[180px]">
            <CustomDropdown
              value={statusFilter}
              options={STATUS_FILTER_OPTIONS}
              onChange={handleStatusFilterChange}
            />
          </div>
        </div>
      </div>

      {/* ── Main Data View ── */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-sm text-gray-400 font-medium">Đang tải dữ liệu...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <Info className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">Không tìm thấy yêu cầu tư vấn nào</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Không có thông tin đăng ký tư vấn nào khớp với bộ lọc hiện tại của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Họ và tên</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Số điện thoại</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Email</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Mục tiêu học</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">Ngày gửi</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 w-[120px]">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleOpenDetail(req)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer border-t border-gray-100"
                  >
                    <td className="px-5 py-3.5 font-bold text-gray-900">{req.fullName}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {req.phone}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {req.email ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {req.email}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate" title={req.message}>
                      {req.message || <span className="text-gray-400 italic text-xs">Chưa cung cấp</span>}
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(req.status)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDetail(req)
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          title="Cập nhật trạng thái"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(req, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Xoá yêu cầu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination controls ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border border-gray-200 bg-white px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Sau
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Hiển thị trang <strong className="text-gray-700">{page}</strong> trên tổng số{' '}
                    <strong className="text-gray-700">{totalPages}</strong> trang ({totalCount} kết quả)
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-lg"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === page ? 'default' : 'outline'}
                      className="h-8 w-8 p-0 rounded-lg text-xs font-bold"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-lg"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dialog 1: Consultation Request Detail & Update Modal ── */}
      {showDetail && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowDetail(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Chi tiết yêu cầu tư vấn</h2>
                <p className="text-xs text-gray-400 mt-0.5">Xem nội dung đăng ký và cập nhật tiến độ xử lý</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1">
              {/* Customer Info Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5 text-sm text-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Học viên</span>
                    <strong className="text-base text-gray-900 font-bold">{selectedRequest.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block text-right">Ngày gửi</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 border-t border-gray-200/50">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Số điện thoại
                    </span>
                    <a href={`tel:${selectedRequest.phone}`} className="text-sm font-semibold text-amber-600 hover:underline block mt-0.5">
                      {selectedRequest.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                    <span className="text-sm font-medium text-gray-800 block mt-0.5 break-all">
                      {selectedRequest.email || <span className="text-gray-400 italic font-normal text-xs">Chưa cung cấp</span>}
                    </span>
                  </div>
                </div>

                {selectedRequest.contactedAt && (
                  <div className="pt-2 border-t border-gray-200/50 flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Liên hệ lúc:{' '}
                      <strong>
                        {new Date(selectedRequest.contactedAt).toLocaleDateString('vi-VN', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Goal Message */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mục tiêu học tập hoặc ghi chú của học viên:</span>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 text-sm text-gray-800 italic leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.message || "Không có ghi chú cụ thể."}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cập nhật Trạng thái xử lý <span className="text-red-500">*</span></label>
                <div className="w-full">
                  <CustomDropdown
                    value={editStatus}
                    options={STATUS_EDIT_OPTIONS}
                    onChange={(val: string) => setEditStatus(val as ConsultationStatus)}
                  />
                </div>
              </div>

              {/* Admin note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú của trung tâm (Kết quả tư vấn, lịch hẹn...)</label>
                <textarea
                  rows={4}
                  placeholder="Nhập ghi chú liên hệ chi tiết tại đây để theo dõi..."
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 resize-none text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 shrink-0">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl text-xs font-bold" onClick={() => setShowDetail(false)}>
                  Đóng lại
                </Button>
                <Button type="submit" className="flex-1 rounded-xl text-xs font-bold" disabled={updating}>
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu cập nhật'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dialog 2: Delete Confirm Modal ── */}
      {showDeleteConfirm && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-bold text-lg text-gray-900">Xác nhận xoá yêu cầu?</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Bạn có chắc chắn muốn xoá yêu cầu tư vấn học tập của học viên{' '}
              <strong className="text-gray-900">{selectedRequest.fullName}</strong> ({selectedRequest.phone})? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 shrink-0">
              <Button variant="secondary" className="flex-1 rounded-xl text-xs font-bold" onClick={() => setShowDeleteConfirm(false)}>
                Huỷ bỏ
              </Button>
              <Button variant="destructive" className="flex-1 rounded-xl text-xs font-bold" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đồng ý xoá'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

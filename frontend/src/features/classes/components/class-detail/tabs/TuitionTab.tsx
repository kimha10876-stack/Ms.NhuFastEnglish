import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Pagination } from '@/shared/components'
import type { ClassDetail } from '@/features/classes/classes.types'
import { CLASS_TABLE_PAGE_SIZE, paginateList } from '../utils'

interface TuitionTabProps {
  cls: ClassDetail
  isAdmin: boolean
  setShowMonthlyFeeModal: (show: boolean) => void
  setNewMonthlyFee: (fee: number) => void
  updateTuitionMutation: {
    isPending: boolean
    mutate: (args: { memberId: string; tuitionStatus: string }) => void
  }
}

export function TuitionTab({
  cls,
  isAdmin,
  setShowMonthlyFeeModal,
  setNewMonthlyFee,
  updateTuitionMutation,
}: TuitionTabProps) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [cls.members.length])

  const pagination = useMemo(
    () => paginateList(cls.members, page, CLASS_TABLE_PAGE_SIZE),
    [cls.members, page],
  )

  if (!isAdmin) return null

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded border border-border bg-background p-5 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Học phí mỗi tháng</p>
              {isAdmin && (
                <button
                  onClick={() => {
                    setNewMonthlyFee(cls.monthlyFee ?? 0)
                    setShowMonthlyFeeModal(true)
                  }}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Cài đặt
                </button>
              )}
            </div>
            <p className="mt-1 text-xl font-black text-primary-700">
              {cls.monthlyFee > 0
                ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}`
                : 'Chưa cấu hình'}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Áp dụng cho mỗi học viên</p>
        </div>

        <div className="rounded border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Đã đóng tháng này</p>
          <p className="mt-1 text-xl font-black text-emerald-600">
            {cls.members.filter((m) => m.tuitionStatus === 'paid').length} / {cls.members.length} học viên
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Tỷ lệ hoàn tất học phí</p>
        </div>

        <div className="rounded border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chưa đóng tháng này</p>
          <p className="mt-1 text-xl font-black text-rose-600">
            {cls.members.filter((m) => m.tuitionStatus !== 'paid').length} học viên
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Cần nhắc nhở thanh toán</p>
        </div>
      </div>

      <div className="space-y-4 rounded border border-border bg-background p-6 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">Trạng thái học phí thành viên</h3>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            Đánh dấu hoặc cập nhật trạng thái nộp học phí của từng học viên
          </p>
        </div>

        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full border-collapse bg-background text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Học viên
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Trạng thái học phí
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cls.members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-xs font-medium text-muted-foreground">
                    Lớp học chưa có thành viên nào.
                  </td>
                </tr>
              ) : (
                pagination.items.map((member) => {
                  const isPaid = member.tuitionStatus === 'paid'
                  return (
                    <tr key={member.memberId} className="transition-colors hover:bg-muted/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              member.fullName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-ink-900">{member.fullName}</p>
                            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${
                            isPaid
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : 'border-rose-100 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isPaid ? 'Đã hoàn tất học phí' : 'Chưa nộp học phí'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant={isPaid ? 'outline' : 'default'}
                          loading={updateTuitionMutation.isPending}
                          onClick={() => {
                            updateTuitionMutation.mutate({
                              memberId: member.memberId,
                              tuitionStatus: isPaid ? 'unpaid' : 'paid',
                            })
                          }}
                          className={`h-8 text-xs font-bold ${
                            isPaid
                              ? 'border-border text-muted-foreground hover:bg-muted'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isPaid ? 'Hủy đánh dấu' : 'Xác nhận đã nộp'}
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {cls.members.length > 0 && (
          <Pagination
            page={pagination.activePage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={CLASS_TABLE_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="học viên"
            className="pt-0"
          />
        )}
      </div>
    </div>
  )
}

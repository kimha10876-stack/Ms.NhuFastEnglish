import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Pagination } from '@/shared/components'
import type { TuitionPayment } from '@/features/classes/classes.types'
import { CLASS_TABLE_PAGE_SIZE, paginateList } from '../utils'

interface PaymentHistoryTabProps {
  tuitions: TuitionPayment[]
  loadingTuitions: boolean
  confirmTuitionMutation: {
    isPending: boolean
    mutate: (args: { paymentId: string; status: 'paid' | 'rejected'; note?: string }) => void
  }
}

export function PaymentHistoryTab({
  tuitions,
  loadingTuitions,
  confirmTuitionMutation,
}: PaymentHistoryTabProps) {
  const [page, setPage] = useState(1)

  const sortedTuitions = useMemo(
    () =>
      [...tuitions].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      ),
    [tuitions],
  )

  useEffect(() => {
    setPage(1)
  }, [sortedTuitions.length])

  const pagination = useMemo(
    () => paginateList(sortedTuitions, page, CLASS_TABLE_PAGE_SIZE),
    [sortedTuitions, page],
  )

  return (
    <div className="space-y-4 text-left">
      <div>
        <h3 className="text-base font-extrabold text-ink-900">Lịch sử thanh toán học phí</h3>
        <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
          Xem và phê duyệt các yêu cầu xác nhận học phí do học viên gửi lên
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
                Số tiền
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phương thức / Mã GD
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Thời gian
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingTuitions ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs font-medium text-muted-foreground">
                  Đang tải dữ liệu thanh toán...
                </td>
              </tr>
            ) : sortedTuitions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs font-medium text-muted-foreground">
                  Chưa có giao dịch chuyển khoản nào được ghi nhận.
                </td>
              </tr>
            ) : (
              pagination.items.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-4 font-bold text-ink-900">{t.studentName}</td>
                  <td className="px-5 py-4 font-extrabold text-primary-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-bold text-foreground">{t.paymentMethod}</span>
                      {t.transactionCode && (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{t.transactionCode}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(t.paidAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${
                        t.status === 'paid'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                          : t.status === 'pending'
                            ? 'border-primary-100 bg-primary-50 text-primary-700'
                            : 'border-red-100 bg-red-50 text-red-700'
                      }`}
                    >
                      {t.status === 'paid' ? 'Đã xác nhận' : t.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    {t.status !== 'paid' ? (
                      <Button
                        size="sm"
                        loading={confirmTuitionMutation.isPending}
                        onClick={() => {
                          confirmTuitionMutation.mutate({
                            paymentId: t.id,
                            status: 'paid',
                            note: 'Admin đã xác nhận nhận đủ tiền',
                          })
                        }}
                        className="h-8 gap-1 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Xác nhận đã nhận học phí
                      </Button>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-600">
                        <Check className="h-3.5 w-3.5" /> Đã duyệt
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loadingTuitions && sortedTuitions.length > 0 && (
        <Pagination
          page={pagination.activePage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={CLASS_TABLE_PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="giao dịch"
          className="pt-0"
        />
      )}
    </div>
  )
}

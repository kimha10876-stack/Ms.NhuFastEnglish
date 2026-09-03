import { X, Receipt, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { useMyPayments } from '../usePayments'
import { Button } from '@/shared/components/ui/button'

interface PaymentHistoryModalProps {
  onClose: () => void
}

export function PaymentHistoryModal({ onClose }: PaymentHistoryModalProps) {
  const { data, isLoading, refetch, isRefetching } = useMyPayments(1, 20)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Thành công
          </span>
        )
      case 'pending':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5" />
            Chờ thanh toán
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Lịch sử thanh toán học phí
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi tất cả các hóa đơn và giao dịch của bạn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs">Đang tải lịch sử thanh toán...</p>
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                Chưa có giao dịch nào
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Khi bạn thực hiện thanh toán học phí, các giao dịch sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.items.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        #{payment.orderCode}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {payment.description || 'Thanh toán học phí'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{formatDate(payment.createdAt)}</span>
                      {payment.className && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {payment.className}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Cổng {payment.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {formatCurrency(payment.finalAmount)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {payment.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button onClick={onClose} variant="outline" className="rounded-xl text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

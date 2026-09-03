import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  QrCode as QrIcon,
  CreditCard,
} from 'lucide-react'
import { usePaymentStatus } from '../usePayments'
import type { PaymentResponse } from '../payments.types'
import { Button } from '@/shared/components/ui/button'

interface PaymentCheckoutModalProps {
  payment: PaymentResponse | null
  onClose: () => void
  onSuccess?: () => void
}

export function PaymentCheckoutModal({ payment, onClose, onSuccess }: PaymentCheckoutModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(1800) // 30 phút = 1800s

  const { data: statusData } = usePaymentStatus(payment?.id, !!payment)

  const isCompleted = statusData?.isCompleted || payment?.status === 'Completed'
  const isFailed = statusData?.isFailed || payment?.status === 'Expired' || payment?.status === 'Cancelled'

  // Countdown timer
  useEffect(() => {
    if (!payment?.expiresAt) return
    const expiry = new Date(payment.expiresAt).getTime()
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      setCountdown(remaining)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [payment?.expiresAt])

  // Trigger onSuccess callback once completed
  useEffect(() => {
    if (isCompleted && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, onSuccess])

  if (!payment) return null

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Thanh toán học phí qua VietQR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động xác nhận qua PayOS trong 1-3 giây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isCompleted ? (
            /* Màn hình thành công */
            <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-5 relative shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12" />
                <span className="absolute -top-1 -right-1 flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 items-center justify-center text-white text-[10px]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Thanh toán thành công!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mb-6">
                Hệ thống đã nhận được số tiền{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.finalAmount)}
                </span>
                . Thông tin học phí của bạn đã được cập nhật tự động.
              </p>

              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-xs space-y-2 mb-6 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã đơn:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                    {payment.paymentCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {payment.description}
                  </span>
                </div>
                {payment.className && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lớp học:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {payment.className}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-medium shadow-sm transition-colors"
              >
                Hoàn tất
              </Button>
            </div>
          ) : isFailed ? (
            /* Màn hình hết hạn hoặc lỗi */
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4">
                <AlertCircle className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Đơn thanh toán đã hết hạn
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                Thời gian thanh toán cho mã QR này đã kết thúc. Vui lòng đóng cửa sổ và thực hiện lại yêu cầu thanh toán mới.
              </p>
              <Button onClick={onClose} variant="outline" className="rounded-xl">
                Đóng
              </Button>
            </div>
          ) : (
            /* Màn hình QR Code thanh toán */
            <div className="flex flex-col items-center">
              {/* QR Code Container */}
              <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-teal-500/40 shadow-md mb-4 group">
                {payment.qrCode ? (
                  <QRCodeSVG
                    value={payment.qrCode}
                    size={210}
                    level="M"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                ) : payment.checkoutUrl ? (
                  <QRCodeSVG
                    value={payment.checkoutUrl}
                    size={210}
                    level="M"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-[210px] h-[210px] flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}

                {/* Sub-badge: VietQR PRO */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>VietQR Chuẩn Quốc Gia • PayOS</span>
                </div>
              </div>

              {/* Status & Countdown banner */}
              <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs mb-4">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  <span>Đang chờ bạn quét mã...</span>
                </div>
                <div className="font-mono font-medium text-slate-500 dark:text-slate-400">
                  Hết hạn sau: <span className="text-teal-600 dark:text-teal-400 font-bold">{formatTime(countdown)}</span>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Số tiền thanh toán:</span>
                  <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(payment.finalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      {`MSNHU${payment.orderCode}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`MSNHU${payment.orderCode}`, 'desc')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'desc' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {payment.className && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Lớp học:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {payment.className}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-3">
                {payment.checkoutUrl && (
                  <a
                    href={payment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 shadow-sm transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mở trang PayOS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="rounded-xl px-4 py-2.5 text-xs font-medium border-slate-200 dark:border-slate-700"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

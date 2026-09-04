import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface ErrorStateProps {
  title?: string
  message?: string
  className?: string
  action?: React.ReactNode
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  className,
  action,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded border-l-4 border-destructive bg-destructive-bg p-4',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        {message && <p className="mt-1 text-xs text-destructive/80">{message}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}

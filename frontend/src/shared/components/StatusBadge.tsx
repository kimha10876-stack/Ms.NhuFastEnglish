import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/utils/cn'

export type EntityStatus =
  | 'active'
  | 'paused'
  | 'ended'
  | 'inactive'
  | 'pending'
  | 'draft'
  | 'published'
  | 'new'
  | 'contacted'
  | 'enrolled'
  | 'rejected'

const STATUS_CONFIG: Record<
  EntityStatus,
  { label: string; variant: 'success' | 'warning' | 'default' | 'destructive' | 'info'; className?: string }
> = {
  active: { label: 'Đang hoạt động', variant: 'success' },
  paused: { label: 'Tạm dừng', variant: 'warning' },
  ended: { label: 'Đã kết thúc', variant: 'default' },
  inactive: { label: 'Đã khóa', variant: 'default' },
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  draft: { label: 'Bản nháp', variant: 'default' },
  published: { label: 'Đã xuất bản', variant: 'success' },
  new: { label: 'Yêu cầu mới', variant: 'info' },
  contacted: { label: 'Đã liên hệ', variant: 'warning' },
  enrolled: { label: 'Đã nhập học', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'destructive' },
}

interface StatusBadgeProps {
  status: EntityStatus | string
  label?: string
  variant?: 'success' | 'warning' | 'default' | 'destructive' | 'info'
  className?: string
}

export function StatusBadge({ status, label, variant, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as EntityStatus] ?? {
    label: status,
    variant: 'default' as const,
  }

  return (
    <Badge variant={variant ?? config.variant} className={cn(config.className, className)}>
      {label ?? config.label}
    </Badge>
  )
}

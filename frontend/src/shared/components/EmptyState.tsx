import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'dashed'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'dashed',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded border bg-card p-6 py-20 text-center',
        variant === 'dashed' ? 'border-dashed border-border' : 'border-border shadow-sm',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

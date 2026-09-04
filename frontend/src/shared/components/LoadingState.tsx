import { cn } from '@/shared/utils/cn'

type LoadingVariant = 'spinner' | 'skeleton-table' | 'skeleton-cards' | 'skeleton-rows'

interface LoadingStateProps {
  variant?: LoadingVariant
  rows?: number
  className?: string
  label?: string
}

export function LoadingState({
  variant = 'spinner',
  rows = 5,
  className,
  label,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded border border-border bg-card p-20 shadow-sm',
          className
        )}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        {label && <p className="text-xs font-semibold text-muted-foreground">{label}</p>}
      </div>
    )
  }

  if (variant === 'skeleton-cards') {
    return (
      <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  if (variant === 'skeleton-table' || variant === 'skeleton-rows') {
    return (
      <div
        className={cn(
          'space-y-3 rounded border border-border bg-card p-6 shadow-sm',
          className
        )}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  return null
}

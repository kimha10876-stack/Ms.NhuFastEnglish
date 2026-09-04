import { cn } from '@/shared/utils/cn'

interface PageSkeletonProps {
  className?: string
}

export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung"
      className={cn('mx-auto w-full max-w-[1280px] space-y-6 px-4 py-6 lg:px-6', className)}
    >
      <div className="space-y-3">
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded border border-border bg-card shadow-sm" />
        ))}
      </div>
      <div className="space-y-3 rounded border border-border bg-card p-4 shadow-sm">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-12 animate-pulse rounded bg-muted',
              index === 0 && 'h-14 bg-muted/80'
            )}
          />
        ))}
      </div>
    </div>
  )
}

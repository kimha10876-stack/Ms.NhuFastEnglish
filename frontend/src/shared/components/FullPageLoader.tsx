import { cn } from '@/shared/utils/cn'

interface FullPageLoaderProps {
  message?: string
  className?: string
}

export function FullPageLoader({
  message = 'Đang tải...',
  className,
}: FullPageLoaderProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        'flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-4',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-background shadow-sm">
          <img
            src="/logo.png"
            alt="Ms Nhu Fast English"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="text-lg font-bold tracking-tight text-ink-900">
          Ms Nhu Fast English
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

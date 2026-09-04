import { cn } from '@/shared/utils/cn'

interface ScrollablePageLayoutProps {
  header: React.ReactNode
  children: React.ReactNode
  fluid?: boolean
  className?: string
}

/** Page shell: header + filters stay fixed; content below scrolls independently. */
export function ScrollablePageLayout({
  header,
  children,
  fluid = false,
  className,
}: ScrollablePageLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto flex h-[calc(100svh-3.5rem)] w-full flex-col gap-6 overflow-hidden px-4 lg:h-svh lg:px-6',
        !fluid && 'max-w-[1280px]',
        className
      )}
    >
      <div className="shrink-0 space-y-6 pt-6">{header}</div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">{children}</div>
    </div>
  )
}

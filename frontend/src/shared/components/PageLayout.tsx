import { cn } from '@/shared/utils/cn'

interface PageLayoutProps {
  children: React.ReactNode
  fluid?: boolean
  className?: string
}

export function PageLayout({ children, fluid = false, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full space-y-6 px-4 py-6 lg:px-6',
        !fluid && 'max-w-[1280px]',
        className
      )}
    >
      {children}
    </div>
  )
}

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink-900">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}
          <span className="truncate">{title}</span>
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

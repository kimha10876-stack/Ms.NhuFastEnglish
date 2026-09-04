import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground',
        success: 'border-success/20 bg-success-bg text-success',
        destructive: 'border-destructive/20 bg-destructive-bg text-destructive',
        warning: 'border-warning/20 bg-warning-bg text-warning',
        info: 'border-info/20 bg-info-bg text-info',
        outline: 'border-border bg-transparent text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

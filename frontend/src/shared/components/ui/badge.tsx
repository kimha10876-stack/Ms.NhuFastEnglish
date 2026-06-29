import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-gray-100 text-gray-700 border-gray-200',
        success:     'bg-emerald-50 text-emerald-700 border-emerald-200',
        destructive: 'bg-red-50 text-red-700 border-red-200',
        warning:     'bg-amber-50 text-amber-700 border-amber-200',
        info:        'bg-blue-50 text-blue-700 border-blue-200',
        outline:     'bg-transparent text-gray-700 border-gray-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#f5c619] text-ink-900 hover:bg-[#f5c619]/80 active:bg-[#f5c619]/70',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline: 'border border-primary bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100',
        secondary: 'border border-border bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80',
        link: 'text-primary-700 underline-offset-4 hover:underline font-medium',
      },
      size: {
        default: 'h-9 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-4 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Comp>
  )
}

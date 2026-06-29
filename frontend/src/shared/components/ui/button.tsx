import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:pointer-events-none disabled:opacity-50 rounded-xl',
  {
    variants: {
      variant: {
        default:     'bg-amber-500 text-gray-900 hover:bg-amber-600',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:     'border border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50',
        secondary:   'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200',
        ghost:       'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        link:        'text-amber-600 underline-offset-4 hover:underline font-medium',
      },
      size: {
        default: 'h-[38px] px-4 text-sm',
        sm:      'h-8 px-3 text-xs rounded-lg',
        lg:      'h-11 px-5 text-[15px]',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

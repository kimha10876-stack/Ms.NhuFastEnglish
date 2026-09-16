import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/shared/utils/cn'

/** Nút vàng brand — dùng chung landing */
export const landingYellowBtn =
  'bg-primary text-[#333333] hover:bg-primary-400 active:bg-primary-500'

const landingBtnBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-heading font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50'

const variantClass = {
  primary: landingYellowBtn,
  dark: landingYellowBtn,
  outline:
    'border-2 border-primary bg-primary/20 text-[#333333] hover:bg-primary hover:border-primary',
  light: 'border-2 border-primary/50 bg-primary/10 text-[#333333] hover:bg-primary/30',
  chip: 'border border-primary/40 bg-primary/15 text-[#333333] hover:bg-primary/30 tracking-normal',
} as const

const sizeClass = {
  sm: 'h-8 px-4 text-xs',
  md: 'h-10 px-6 text-sm',
  lg: 'h-11 px-7 text-base',
  chip: 'h-auto px-4 py-1.5 text-sm',
  full: 'h-11 w-full px-6 text-sm',
} as const

type LandingButtonVariant = keyof typeof variantClass
type LandingButtonSize = keyof typeof sizeClass

interface LandingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LandingButtonVariant
  size?: LandingButtonSize
  asChild?: boolean
}

export function LandingButton({
  variant = 'primary',
  size = 'md',
  asChild = false,
  className,
  ...props
}: LandingButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const resolvedSize = variant === 'chip' ? 'chip' : size

  return (
    <Comp
      className={cn(landingBtnBase, variantClass[variant], sizeClass[resolvedSize], className)}
      {...props}
    />
  )
}

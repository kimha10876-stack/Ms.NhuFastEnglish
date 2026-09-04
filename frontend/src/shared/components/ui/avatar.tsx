import { cn } from '@/shared/utils/cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClass: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize
  src?: string
  alt?: string
  initials?: string
}

export function Avatar({ size = 'md', src, alt, initials, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-bold text-primary-700',
        sizeClass[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

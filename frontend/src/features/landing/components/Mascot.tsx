import { cn } from '@/shared/utils/cn'
import { MASCOTS, type MascotKey } from '../landing.data'

export function Mascot({
  name,
  alt = '',
  className,
  imgClassName,
}: {
  name: MascotKey
  alt?: string
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={cn('pointer-events-none select-none', className)} aria-hidden={!alt}>
      <img
        src={MASCOTS[name]}
        alt={alt}
        loading="lazy"
        draggable={false}
        className={cn('h-auto w-full object-contain drop-shadow-md', imgClassName)}
      />
    </div>
  )
}

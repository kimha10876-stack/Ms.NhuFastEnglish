import { cn } from '@/shared/utils/cn'

export function SectionHeading({
  eyebrow,
  eyebrowClass = 'bg-primary-100 text-primary-800',
  title,
  desc,
  onDark = false,
  className,
}: {
  eyebrow?: string
  eyebrowClass?: string
  title: string
  desc?: string
  onDark?: boolean
  className?: string
}) {
  return (
    <div className={cn('mx-auto max-w-2xl text-center', className)}>
      {eyebrow && (
        <span
          className={cn(
            'mb-3 inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wider',
            eyebrowClass
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-balance text-2xl tracking-tight sm:text-3xl',
          onDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed sm:text-base',
            onDark ? 'text-white/60' : 'text-gray-600'
          )}
        >
          {desc}
        </p>
      )}
    </div>
  )
}

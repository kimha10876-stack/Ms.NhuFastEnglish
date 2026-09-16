import { cn } from '@/shared/utils/cn'

/** Section header kiểu IEC: pill eyebrow + title có highlight + mô tả */
export function IecSectionHeader({
  eyebrow,
  title,
  titleHighlight,
  desc,
  className,
  dark = false,
  align = 'center',
  eyebrowPill = false,
}: {
  eyebrow?: string
  /** Toàn bộ title (nếu không dùng titleHighlight) */
  title: string
  /** Phần title tô màu accent — giống IEC "Phát Triển Toàn Diện" */
  titleHighlight?: string
  desc?: string
  className?: string
  dark?: boolean
  align?: 'center' | 'left'
  eyebrowPill?: boolean
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left',
        className
      )}
    >
      {eyebrow && (
        eyebrowPill ? (
          <span className="inline-block rounded-full bg-primary px-4 py-1.5 font-heading text-[11px] uppercase tracking-wider text-[#333333]">
            {eyebrow}
          </span>
        ) : (
          <p
            className={cn(
              'text-xs uppercase tracking-[0.2em]',
              dark ? 'text-primary' : 'text-primary-700'
            )}
          >
            {eyebrow}
          </p>
        )
      )}
      <h2
        className={cn(
          'font-heading mt-4 text-balance text-[28px] font-extrabold leading-tight tracking-tight sm:text-[40px]',
          dark ? 'text-white' : 'text-[#222222]'
        )}
      >
        {titleHighlight ? (
          <>
            {title}
            <span className="font-extrabold text-primary"> {titleHighlight}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {desc && (
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed sm:text-base',
            dark ? 'text-white/70' : 'text-gray-600'
          )}
        >
          {desc}
        </p>
      )}
    </div>
  )
}

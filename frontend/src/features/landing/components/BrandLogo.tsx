import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

export function BrandLogo({ alt, className }: { alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary text-[#333333]',
          className
        )}
      >
        MN
      </div>
    )
  }

  return (
    <div className={cn('shrink-0 overflow-hidden rounded-full bg-white shadow-sm', className)}>
      <img
        src="/logo.png"
        alt={alt}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

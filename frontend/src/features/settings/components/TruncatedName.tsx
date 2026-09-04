import { cn } from '@/shared/utils/cn'

interface TruncatedNameProps {
  name: string
  className?: string
  as?: 'span' | 'p' | 'h4'
}

export function TruncatedName({ name, className, as: Tag = 'span' }: TruncatedNameProps) {
  return (
    <Tag className={cn('block truncate', className)} title={name}>
      {name}
    </Tag>
  )
}

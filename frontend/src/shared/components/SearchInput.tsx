import { Search, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
  containerClassName?: string
}

export function SearchInput({
  value,
  onClear,
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && value !== null && String(value).length > 0

  return (
    <div className={cn('relative flex-1', containerClassName)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        className={cn('w-full pl-9 text-sm', hasValue && onClear && 'pr-9', className)}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Xóa tìm kiếm"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

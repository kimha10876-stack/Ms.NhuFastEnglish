import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
  bordered?: boolean
}

function getVisiblePages(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (page > 3) pages.push('ellipsis')

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (page < totalPages - 2) pages.push('ellipsis')

  pages.push(totalPages)
  return pages
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  itemLabel = 'mục',
  className,
  bordered = false,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 sm:flex-row',
        bordered ? 'border-t border-border px-6 py-4' : 'pt-6',
        className
      )}
    >
      <p className="text-xs font-semibold text-muted-foreground">
        Hiển thị {itemLabel} từ{' '}
        <span className="font-bold text-ink-900">{from}</span> đến{' '}
        <span className="font-bold text-ink-900">{to}</span> trong tổng số{' '}
        <span className="font-bold text-ink-900">{totalCount}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className="h-8 min-w-8 px-2 text-xs font-bold"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

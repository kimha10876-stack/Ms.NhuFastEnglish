import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/utils/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className,
  emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded border border-border bg-background shadow-sm', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

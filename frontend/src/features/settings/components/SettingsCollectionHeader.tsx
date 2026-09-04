import { LayoutGrid, List, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'
import type { SettingsViewMode } from '../settings.constants'

interface SettingsCollectionHeaderProps {
  title: string
  description: string
  addLabel: string
  onAdd: () => void
  viewMode: SettingsViewMode
  onViewModeChange: (mode: SettingsViewMode) => void
  addClassName?: string
}

export function SettingsCollectionHeader({
  title,
  description,
  addLabel,
  onAdd,
  viewMode,
  onViewModeChange,
  addClassName,
}: SettingsCollectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink-900">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center rounded border border-border bg-muted p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('card')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded transition-colors',
              viewMode === 'card'
                ? 'bg-background text-ink-900 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Xem dạng thẻ"
            title="Xem dạng thẻ"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded transition-colors',
              viewMode === 'list'
                ? 'bg-background text-ink-900 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Xem dạng danh sách"
            title="Xem dạng danh sách"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <Button onClick={onAdd} className={cn('gap-1.5', addClassName)}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  )
}

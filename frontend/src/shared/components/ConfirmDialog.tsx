import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  loading?: boolean
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  onConfirm,
  loading = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-w-sm">
        <div className="px-6 pt-6 text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border',
              variant === 'destructive'
                ? 'border-red-100 bg-red-50 text-red-500'
                : 'border-warning/20 bg-warning-bg text-warning'
            )}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogHeader className="border-0 px-0 py-0 text-center">
            <DialogTitle className="text-base">{title}</DialogTitle>
            <DialogDescription className="mt-1 px-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="gap-2.5 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded text-xs font-bold"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className={cn('flex-1 text-xs font-bold', variant === 'destructive' && 'shadow-sm')}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

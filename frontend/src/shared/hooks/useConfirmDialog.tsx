import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

export interface ConfirmDialogOptions {
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void
}

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null)
  const [loading, setLoading] = useState(false)

  const ask = useCallback((next: ConfirmDialogOptions) => {
    setOptions(next)
  }, [])

  const close = useCallback(() => {
    if (!loading) setOptions(null)
  }, [loading])

  const confirmDialog = (
    <ConfirmDialog
      open={!!options}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      title={options?.title ?? ''}
      description={options?.description ?? ''}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      variant={options?.variant ?? 'destructive'}
      loading={loading}
      onConfirm={() => options?.onConfirm()}
    />
  )

  return { ask, close, setLoading, confirmDialog }
}

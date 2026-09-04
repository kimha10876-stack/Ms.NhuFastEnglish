import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface DeleteConfirmModalProps {
  show: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
  isPending?: boolean
}

export function DeleteConfirmModal({
  show,
  title,
  message,
  onClose,
  onConfirm,
  isPending = false,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmDialog
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={message}
      confirmLabel="Xác nhận xóa"
      cancelLabel="Quay lại"
      onConfirm={onConfirm}
      loading={isPending}
      variant="destructive"
    />
  )
}

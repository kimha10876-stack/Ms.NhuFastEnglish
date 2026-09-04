import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface RevokeInviteModalProps {
  show: boolean
  onClose: () => void
  onRevoke: () => void
  revokingInvite: boolean
}

export function RevokeInviteModal({
  show,
  onClose,
  onRevoke,
  revokingInvite,
}: RevokeInviteModalProps) {
  return (
    <ConfirmDialog
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title="Hủy link mời học viên?"
      description="Bạn có chắc chắn muốn hủy link mời này? Học sinh sẽ không thể tham gia lớp học qua link này được nữa."
      confirmLabel="Xác nhận hủy"
      cancelLabel="Quay lại"
      onConfirm={onRevoke}
      loading={revokingInvite}
      variant="destructive"
    />
  )
}

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal } from '@/shared/components/Modal'

interface InviteModalProps {
  show: boolean
  onClose: () => void
  expiryDays: number
  setExpiryDays: (days: number) => void
  onInvite: () => void
  creatingInvite: boolean
}

export function InviteModal({
  show,
  onClose,
  expiryDays,
  setExpiryDays,
  onInvite,
  creatingInvite,
}: InviteModalProps) {
  return (
    <Modal
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title="Tạo link mời"
      description="Học viên dùng link này để tham gia lớp"
      size="sm"
      footer={
        <>
          <Button variant="secondary" className="flex-1 rounded" onClick={onClose}>
            Huỷ
          </Button>
          <Button className="flex-1" onClick={onInvite} loading={creatingInvite}>
            Tạo link
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider">Thời hạn (ngày)</label>
        <Input
          type="number"
          min="0"
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
          className="rounded"
        />
        <p className="text-xs text-muted-foreground">Nhập 0 để link không bao giờ hết hạn</p>
      </div>
    </Modal>
  )
}

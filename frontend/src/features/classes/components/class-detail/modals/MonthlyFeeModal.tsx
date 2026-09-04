import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal } from '@/shared/components/Modal'

interface MonthlyFeeModalProps {
  show: boolean
  onClose: () => void
  newMonthlyFee: number
  setNewMonthlyFee: (fee: number) => void
  onSave: () => void
  updating: boolean
}

export function MonthlyFeeModal({
  show,
  onClose,
  newMonthlyFee,
  setNewMonthlyFee,
  onSave,
  updating,
}: MonthlyFeeModalProps) {
  return (
    <Modal
      open={show}
      onOpenChange={(open) => !open && onClose()}
      title="Cài đặt học phí lớp"
      description="Áp dụng số tiền thu hàng tháng cho học viên"
      size="sm"
      footer={
        <>
          <Button variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={updating} className="flex-1 text-xs font-bold text-gray-950" onClick={onSave}>
            Lưu học phí
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <label className="text-xs">Mức học phí hàng tháng (VNĐ)</label>
        <Input
          type="number"
          min={0}
          step={50000}
          value={newMonthlyFee}
          onChange={(e) => setNewMonthlyFee(Number(e.target.value) || 0)}
          placeholder="VD: 800000"
          className="w-full rounded text-sm font-bold"
        />
        <p className="text-xs text-muted-foreground">
          Hiển thị:{' '}
          <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(newMonthlyFee)}</strong>{' '}
          / tháng
        </p>
      </div>
    </Modal>
  )
}

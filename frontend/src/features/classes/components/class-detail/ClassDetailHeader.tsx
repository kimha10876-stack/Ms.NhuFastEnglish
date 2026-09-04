import { ArrowLeft, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ClassDetail } from '../../classes.types'
import { STATUS_COLOR, STATUS_LABEL } from './utils'

interface ClassDetailHeaderProps {
  cls: ClassDetail
}

export function ClassDetailHeader({ cls }: ClassDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-4 text-left">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          onClick={() => navigate('/classes')}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900"
          title="Quay lại danh sách"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-extrabold tracking-tight text-ink-900 md:text-lg" title={cls.name}>
              {cls.name}
            </h1>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: cls.categoryColorHex }}
            >
              {cls.categoryName}
            </span>
            <span
              className={`shrink-0 rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}
            >
              {STATUS_LABEL[cls.status] ?? cls.status}
            </span>
            {cls.monthlyFee > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-800">
                <CreditCard className="h-3 w-3 text-primary-600" />
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border bg-gray-200 px-2 py-0.5 text-xs font-bold text-muted-foreground">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                Chưa đặt học phí
              </span>
            )}
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-medium text-muted-foreground">
            <span>
              Giáo viên: <span className="font-bold text-muted-foreground">{cls.teacherName}</span>
            </span>
            {cls.room && (
              <>
                <span>•</span>
                <span>
                  Phòng: <span className="font-bold text-muted-foreground">{cls.room}</span>
                </span>
              </>
            )}
            {(cls.scheduleDays || cls.scheduleTime) && (
              <>
                <span>•</span>
                <span>
                  Lịch học:{' '}
                  <span className="font-bold text-muted-foreground">
                    {cls.scheduleDays} {cls.scheduleTime}
                  </span>
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

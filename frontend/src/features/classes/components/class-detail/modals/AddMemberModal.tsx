import { Search, AlertTriangle, Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import type { StudentSearchResult } from '@/features/classes/classes.types'

interface AddMemberModalProps {
  show: boolean
  onClose: () => void
  searchQ: string
  setSearchQ: (q: string) => void
  searchResults: StudentSearchResult[]
  clsMembers: Array<{ studentId: string }>
  addError: string
  setAddError: (err: string) => void
  onAddMember: (studentId: string) => void
  adding: boolean
}

export function AddMemberModal({
  show,
  onClose,
  searchQ,
  setSearchQ,
  searchResults,
  clsMembers,
  addError,
  setAddError,
  onAddMember,
  adding,
}: AddMemberModalProps) {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose className="flex h-[480px] max-h-[90vh] max-w-md flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Thêm học viên vào lớp</DialogTitle>
          <DialogDescription>Tìm học viên đã đăng ký tài khoản tại hệ thống</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Nhập tên hoặc email học viên..."
              value={searchQ}
              onChange={(e) => {
                setSearchQ(e.target.value)
                setAddError('')
              }}
              className="rounded border-border py-2.5 pl-10 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500/20"
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {addError && (
            <div className="rounded-r-xl border-l-4 border-red-500 bg-red-50 px-4 py-2.5">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {addError}
              </p>
            </div>
          )}

          {searchQ.trim().length < 2 && (
            <div className="flex flex-1 flex-col items-center justify-center py-4 text-center text-muted-foreground">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Hãy nhập từ khóa tìm kiếm</p>
              <p className="mt-1 max-w-[240px] text-xs font-medium text-muted-foreground">
                Nhập tối thiểu 2 ký tự (tên hoặc email) để hệ thống bắt đầu tìm kiếm học viên
              </p>
            </div>
          )}

          {searchQ.trim().length >= 2 && (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Kết quả tìm kiếm ({searchResults.length})
              </p>

              {searchResults.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-border bg-muted/50 py-4 text-center text-muted-foreground">
                  <p className="text-sm font-semibold text-muted-foreground">Không tìm thấy học viên</p>
                  <p className="mt-1 max-w-[220px] text-xs font-medium text-muted-foreground">
                    Hãy chắc chắn rằng học viên đã tạo tài khoản với email này
                  </p>
                </div>
              ) : (
                <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto rounded border border-border bg-background">
                  {searchResults.map((s) => {
                    const isAlreadyMember = clsMembers.some((m) => m.studentId === s.studentId)

                    return (
                      <div
                        key={s.studentId}
                        className="flex items-center justify-between p-3.5 transition-colors hover:bg-primary-50/20"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200/50 bg-primary-100">
                            <span className="text-xs font-bold text-primary-700">{s.fullName[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold leading-snug text-ink-900">{s.fullName}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>

                        {isAlreadyMember ? (
                          <span className="select-none rounded border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                            Đã tham gia
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onAddMember(s.studentId)}
                            disabled={adding}
                            className="h-8 gap-1 rounded px-3 text-xs font-semibold transition-all hover:bg-primary-500 hover:text-white"
                          >
                            {adding ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                Thêm
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

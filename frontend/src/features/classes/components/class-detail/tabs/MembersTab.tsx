import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Link2, Check, Copy, Users, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Pagination } from '@/shared/components'
import type { ClassDetail } from '@/features/classes/classes.types'
import { CLASS_TABLE_PAGE_SIZE, paginateList } from '../utils'

interface MembersTabProps {
  cls: ClassDetail
  isStaff: boolean
  activeInvite: any
  copied: boolean
  handleCopy: (text: string) => void
  setShowAdd: (show: boolean) => void
  setShowInvite: (show: boolean) => void
  setShowRevokeConfirm: (show: boolean) => void
  removeMember: (memberId: string) => void
  setDeleteConfirm: React.Dispatch<
    React.SetStateAction<{
      show: boolean
      title: string
      message: string
      onConfirm: () => void
    }>
  >
}

export function MembersTab({
  cls,
  isStaff,
  activeInvite,
  copied,
  handleCopy,
  setShowAdd,
  setShowInvite,
  setShowRevokeConfirm,
  removeMember,
  setDeleteConfirm,
}: MembersTabProps) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [cls.members.length])

  const pagination = useMemo(
    () => paginateList(cls.members, page, CLASS_TABLE_PAGE_SIZE),
    [cls.members, page],
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5 rounded border border-border bg-background p-6 text-left shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">Thành viên lớp học</h3>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">Danh sách các học viên đang tham gia lớp</p>
        </div>
        <span className="rounded border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          Sĩ số: {cls.members.length} học viên
        </span>
      </div>

      {isStaff && (
        <div className="grid grid-cols-1 gap-3 rounded border border-border bg-muted/50 p-4 sm:grid-cols-2">
          <Button
            onClick={() => setShowAdd(true)}
            className="h-9 w-full gap-1.5 rounded bg-primary-500 text-xs font-bold text-ink-900 hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            Thêm học viên trực tiếp
          </Button>

          {activeInvite ? (
            <div className="animate-in fade-in space-y-2 duration-200">
              <div className="flex h-9 items-center gap-2 rounded border border-border bg-background px-3 py-1.5 text-xs">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                <span className="flex-1 truncate font-mono text-muted-foreground">{activeInvite.inviteUrl}</span>
                <button
                  onClick={() => handleCopy(activeInvite.inviteUrl)}
                  className="shrink-0 rounded p-1 transition-colors hover:bg-muted"
                  title="Sao chép link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 animate-in zoom-in text-emerald-600 duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-primary-600" />
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowInvite(true)} className="h-7 flex-1 rounded text-xs font-bold">
                  Tạo link mới
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRevokeConfirm(true)}
                  className="h-7 flex-1 rounded border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Hủy link
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowInvite(true)} className="h-9 w-full gap-1.5 rounded text-xs font-bold">
              <Link2 className="h-4 w-4" />
              Tạo link mời học viên
            </Button>
          )}
        </div>
      )}

      {cls.members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-border bg-muted/50 py-12">
          <Users className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-xs font-bold text-muted-foreground">Chưa có học viên nào tham gia</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {pagination.items.map((m) => (
              <div
                key={m.memberId}
                className="flex items-center justify-between rounded border border-border bg-muted/20 p-3 transition-all hover:border-primary-200/30 hover:bg-primary-50/5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-200/30 bg-primary-100">
                    <span className="text-xs font-bold text-primary-700">{m.fullName[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold leading-snug text-ink-900">{m.fullName}</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">{m.email}</p>
                  </div>
                </div>

                {isStaff && (
                  <button
                    onClick={() => {
                      setDeleteConfirm({
                        show: true,
                        title: 'Xóa học viên khỏi lớp?',
                        message: `Bạn có chắc muốn xóa học viên ${m.fullName} khỏi lớp học này không?`,
                        onConfirm: () => {
                          removeMember(m.memberId)
                          setDeleteConfirm((prev) => ({ ...prev, show: false }))
                        },
                      })
                    }}
                    className="ml-2 shrink-0 rounded p-1.5 text-gray-405 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Xóa khỏi lớp"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Pagination
            page={pagination.activePage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={CLASS_TABLE_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="học viên"
            className="pt-0"
          />
        </div>
      )}
    </div>
  )
}

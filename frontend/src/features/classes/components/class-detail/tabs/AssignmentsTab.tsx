import React, { useEffect, useMemo, useState } from 'react'
import {
  PlusCircle,
  Loader2,
  CheckSquare,
  Clock,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Pagination } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import type { ClassAssignment } from '@/features/classes/classes.types'
import { CLASS_TABLE_PAGE_SIZE, paginateList } from '../utils'

type AssignmentViewMode = 'card' | 'list'

interface AssignmentsTabProps {
  assignments: ClassAssignment[]
  loadingAssignments: boolean
  isStaff: boolean
  isStudent: boolean
  handleOpenAddAssignment: () => void
  handleOpenEditAssignment: (assignment: ClassAssignment, e: React.MouseEvent) => void
  handleDeleteAssignment: (assignmentId: string, e: React.MouseEvent) => void
  setSelectedAssignment: (assignment: ClassAssignment) => void
  setStaffViewTab: (tab: 'submissions' | 'preview') => void
}

function getAssignmentStatusBadge(a: ClassAssignment, isStudent: boolean, isStaff: boolean) {
  const isOverdue = !!(a.dueDate && new Date(a.dueDate) < new Date())

  if (isStudent) {
    if (a.submission) {
      if (a.submission.grade !== null) {
        if (a.assignmentType === 'Quiz') {
          const totalQuestions = a.questionsJson ? (JSON.parse(a.questionsJson) as unknown[]).length : 0
          const correctAnswers = a.submission.grade
          const percent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
          return (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 shadow-sm">
              Đúng {correctAnswers}/{totalQuestions} câu ({percent}%)
            </span>
          )
        }
        return (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 shadow-sm">
            Đã chấm: {a.submission.grade}/10
          </span>
        )
      }
      return (
        <span className="animate-pulse rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700 shadow-sm">
          Đã nộp bài (Chờ chấm)
        </span>
      )
    }
    return (
      <span
        className={cn(
          'rounded-full border px-2 py-0.5 text-xs font-bold',
          isOverdue ? 'border-red-200 bg-red-50 text-red-600' : 'border-border bg-muted text-muted-foreground',
        )}
      >
        {isOverdue ? 'Trễ hạn nộp' : 'Chưa nộp bài'}
      </span>
    )
  }

  if (isStaff) {
    return (
      <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700 shadow-sm">
        {a.submissionsCount} học sinh đã nộp
      </span>
    )
  }

  return null
}

function formatDueDate(dueDate: string | null, isOverdue: boolean, hasSubmission: boolean) {
  if (!dueDate) return <span className="text-muted-foreground">Không có hạn chót</span>
  return (
    <span className={cn('font-bold', isOverdue && !hasSubmission ? 'text-red-500' : 'text-muted-foreground')}>
      {new Date(dueDate).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  )
}

export function AssignmentsTab({
  assignments,
  loadingAssignments,
  isStaff,
  isStudent,
  handleOpenAddAssignment,
  handleOpenEditAssignment,
  handleDeleteAssignment,
  setSelectedAssignment,
  setStaffViewTab,
}: AssignmentsTabProps) {
  const [viewMode, setViewMode] = useState<AssignmentViewMode>('card')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [assignments.length, viewMode])

  const pagination = useMemo(
    () => paginateList(assignments, page, CLASS_TABLE_PAGE_SIZE),
    [assignments, page],
  )

  const openAssignment = (a: ClassAssignment) => {
    setSelectedAssignment(a)
    setStaffViewTab('submissions')
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {assignments.length > 0 && (
          <div className="flex items-center rounded border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors',
                viewMode === 'card'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Xem dạng thẻ"
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Xem dạng bảng"
              title="Xem dạng bảng"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}

        {isStaff && (
          <Button size="sm" onClick={handleOpenAddAssignment} className="ml-auto gap-1.5 rounded text-xs font-semibold">
            <PlusCircle className="h-4 w-4" />
            Giao bài tập mới
          </Button>
        )}
      </div>

      {loadingAssignments ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-border bg-muted/50 py-16">
          <CheckSquare className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-semibold text-muted-foreground">Chưa có bài tập nào được giao</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Nội dung bài tập của bạn sẽ xuất hiện tại đây khi giáo viên đăng bài
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pagination.items.map((a) => {
              const isOverdue = !!(a.dueDate && new Date(a.dueDate) < new Date())
              return (
                <div
                  key={a.id}
                  onClick={() => openAssignment(a)}
                  className="group flex cursor-pointer flex-col justify-between rounded border border-border bg-background p-5 transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h4 className="line-clamp-2 text-sm font-extrabold text-ink-900 transition-colors group-hover:text-primary-600">
                        {a.title}
                      </h4>
                      <div className="shrink-0">{getAssignmentStatusBadge(a, isStudent, isStaff)}</div>
                    </div>
                    <p className="mb-4 line-clamp-3 text-xs font-medium leading-relaxed text-muted-foreground">
                      {a.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Hạn nộp: {formatDueDate(a.dueDate, isOverdue, !!a.submission)}
                    </span>

                    {isStaff && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => handleOpenEditAssignment(a, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-ink-900"
                          title="Sửa bài tập"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAssignment(a.id, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                          title="Xóa bài tập"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination
            page={pagination.activePage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={CLASS_TABLE_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="bài tập"
            className="pt-0"
          />
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full border-collapse bg-background text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Hạn nộp
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                  {isStaff && (
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagination.items.map((a) => {
                  const isOverdue = !!(a.dueDate && new Date(a.dueDate) < new Date())
                  return (
                    <tr
                      key={a.id}
                      onClick={() => openAssignment(a)}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-ink-900">{a.title}</p>
                        {a.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.description}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {formatDueDate(a.dueDate, isOverdue, !!a.submission)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getAssignmentStatusBadge(a, isStudent, isStaff)}</td>
                      {isStaff && (
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => handleOpenEditAssignment(a, e)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-ink-900"
                              title="Sửa bài tập"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteAssignment(a.id, e)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                              title="Xóa bài tập"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.activePage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={CLASS_TABLE_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="bài tập"
            className="pt-0"
          />
        </>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import {
  Calendar, Check, Megaphone, Bold, Italic, Underline, Send, Loader2,
  MoreVertical, Edit2, Trash2, Sparkles
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ClassDetail, ClassSession, ClassAssignment } from '@/features/classes/classes.types'
import {
  useClassAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
  useCreateComment, useDeleteComment
} from '@/features/classes/useClasses'
import { toast } from '@/shared/utils/toast'
import { formatContent, type Tab } from '../utils'

interface AnnouncementsTabProps {
  classId: string
  cls: ClassDetail
  sessions: ClassSession[]
  assignments: ClassAssignment[]
  isStaff: boolean
  isStudent: boolean
  isAdmin: boolean
  user: any
  onTabChange: (tab: Tab) => void
}

export function AnnouncementsTab({
  classId,
  cls,
  sessions,
  assignments,
  isStaff,
  isStudent,
  isAdmin,
  user,
  onTabChange,
}: AnnouncementsTabProps) {
  const { data: announcements = [], isLoading: loadingAnnouncements } = useClassAnnouncements(classId)
  const createAnnouncementMutation = useCreateAnnouncement(classId)
  const updateAnnouncementMutation = useUpdateAnnouncement(classId)
  const deleteAnnouncementMutation = useDeleteAnnouncement(classId)
  const createCommentMutation = useCreateComment(classId)
  const deleteCommentMutation = useDeleteComment(classId)

  const [announcementContent, setAnnouncementContent] = useState('')
  const [commentContents, setCommentContents] = useState<Record<string, string>>({})
  const [isComposerExpanded, setIsComposerExpanded] = useState(false)

  // 3-dots actions & edit states
  const [openActionAnnId, setOpenActionAnnId] = useState<string | null>(null)
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null)
  const [editingAnnContent, setEditingAnnContent] = useState('')
  const [expandedCommentAnnId, setExpandedCommentAnnId] = useState<string | null>(null)
  const [replyParentCommentId, setReplyParentCommentId] = useState<Record<string, string | null>>({})

  const handleFormat = (type: 'bold' | 'italic' | 'underline', targetId = 'announcement-editor') => {
    const textarea = document.getElementById(targetId) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    let replacement = ''
    let cursorOffset = 0
    if (type === 'bold') {
      replacement = `**${selectedText || 'in đậm'}**`
      cursorOffset = selectedText ? end + 4 : start + 2
    } else if (type === 'italic') {
      replacement = `*${selectedText || 'in nghiêng'}*`
      cursorOffset = selectedText ? end + 2 : start + 1
    } else if (type === 'underline') {
      replacement = `__${selectedText || 'gạch chân'}__`
      cursorOffset = selectedText ? end + 4 : start + 2
    }

    const newVal = text.substring(0, start) + replacement + text.substring(end)
    if (targetId === 'announcement-editor') {
      setAnnouncementContent(newVal)
    } else if (targetId.startsWith('comment-editor-')) {
      const annId = targetId.substring('comment-editor-'.length)
      setCommentContents(prev => ({ ...prev, [annId]: newVal }))
    } else {
      setEditingAnnContent(newVal)
    }

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + replacement.length)
      } else {
        textarea.setSelectionRange(cursorOffset, cursorOffset + (type === 'bold' || type === 'underline' ? 6 : 10))
      }
    }, 0)
  }

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementContent.trim()) return
    createAnnouncementMutation.mutate(
      { content: announcementContent.trim() },
      {
        onSuccess: () => {
          setAnnouncementContent('')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Không thể đăng thông báo')
        }
      }
    )
  }

  const handleDeleteAnnouncement = (annId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return
    deleteAnnouncementMutation.mutate(annId, {
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Không thể xóa thông báo')
      }
    })
  }

  const handleUpdateAnnouncement = (annId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnnContent.trim()) return
    updateAnnouncementMutation.mutate(
      { announcementId: annId, content: editingAnnContent.trim() },
      {
        onSuccess: () => {
          setEditingAnnId(null)
          setEditingAnnContent('')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Không thể cập nhật thông báo')
        }
      }
    )
  }

  const handlePostComment = (annId: string, e: React.FormEvent) => {
    e.preventDefault()
    const content = commentContents[annId]
    if (!content || !content.trim()) return
    const parentCommentId = replyParentCommentId[annId] || null
    createCommentMutation.mutate(
      { announcementId: annId, content: content.trim(), parentCommentId },
      {
        onSuccess: () => {
          setCommentContents(prev => ({ ...prev, [annId]: '' }))
          setExpandedCommentAnnId(null)
          setReplyParentCommentId(prev => ({ ...prev, [annId]: null }))
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Không thể đăng bình luận')
        }
      }
    )
  }

  const handleReplyToComment = (annId: string, authorName: string, commentId: string, parentCommentId?: string | null) => {
    setExpandedCommentAnnId(annId)
    const targetParentId = parentCommentId || commentId
    setReplyParentCommentId(prev => ({ ...prev, [annId]: targetParentId }))

    const mentionText = `**@${authorName}** `
    setCommentContents(prev => {
      const current = prev[annId] ?? ''
      if (current.includes(mentionText)) return prev
      return { ...prev, [annId]: mentionText + current }
    })
    setTimeout(() => {
      const textarea = document.getElementById(`comment-editor-${annId}`) as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length
      }
    }, 100)
  }

  const handleDeleteComment = (annId: string, commentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return
    deleteCommentMutation.mutate(
      { announcementId: annId, commentId },
      {
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Không thể xóa bình luận')
        }
      }
    )
  }

  return (
    <div className="space-y-6 text-left w-full">
      {/* Class Banner Card */}
      <div className="relative rounded overflow-hidden shadow-md bg-gradient-to-r from-primary-600 via-primary-800 to-slate-900 p-8 text-white min-h-[140px] md:min-h-[180px] flex flex-col justify-end">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200 via-primary-400 to-transparent pointer-events-none" />
        <div className="z-10">
          <span className="text-xs uppercase font-bold tracking-widest bg-primary-500/30 border border-primary-300/30 text-primary-200 px-2.5 py-0.5 rounded-full mb-2.5 inline-block">
            {cls.categoryName || 'Lớp học'}
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm mb-1">{cls.name}</h2>
          <p className="text-xs md:text-sm text-primary-200/90 font-medium flex items-center gap-1.5 mt-1.5">
            <span>Giáo viên chính: <strong>{cls.teacherName}</strong></span>
            <span className="text-primary-400/60">•</span>
            <span>Sĩ số: <strong>{cls.members.length} học viên</strong></span>
            <span className="text-primary-400/60">•</span>
            <span>Số buổi học: <strong>{sessions.length} buổi</strong></span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left sidebar info box on large screens */}
        {isStudent && (
          <div className="space-y-4 md:col-span-1 hidden md:block">
            <div className="bg-background border border-border/80 rounded p-4 shadow-sm">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                <Calendar className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                Sắp diễn ra
              </h3>
              {(() => {
                const todoAssignments = assignments.filter(a => !a.submission)

                if (todoAssignments.length === 0) {
                  return (
                    <div className="text-center py-2">
                      <Check className="h-5 w-5 text-emerald-500 mx-auto mb-1.5 animate-bounce" />
                      <p className="text-xs text-emerald-600 font-extrabold">Tuyệt vời!</p>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">Bạn đã hoàn thành tất cả bài tập.</p>
                    </div>
                  )
                }

                const sortedTodo = [...todoAssignments].sort((a, b) => {
                  if (!a.dueDate) return 1
                  if (!b.dueDate) return -1
                  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                })

                return (
                  <div className="space-y-2.5">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Bạn có {todoAssignments.length} bài tập chưa hoàn thành:</p>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none">
                      {sortedTodo.slice(0, 4).map((a) => {
                        const isOverdue = a.dueDate && new Date(a.dueDate).getTime() < Date.now()
                        return (
                          <div
                            key={a.id}
                            onClick={() => onTabChange('assignments')}
                            className="text-left p-2 rounded bg-muted/50 hover:bg-primary-50/30 border border-border/60 hover:border-primary-200/50 cursor-pointer transition-all duration-250"
                          >
                            <div className="font-bold text-ink-900 text-xs truncate" title={a.title}>
                              {a.title}
                            </div>
                            <div className="flex items-center justify-between mt-1 gap-1.5 flex-wrap">
                              <span className={`text-xs font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                isOverdue
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-primary-50 text-primary-600 border border-primary-100"
                              }`}>
                                {isOverdue ? "Quá hạn" : "Chưa nộp"}
                              </span>
                              {a.dueDate ? (
                                <span className="text-xs text-muted-foreground font-semibold">
                                  Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground font-semibold">Không hạn</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => onTabChange('assignments')}
                      className="w-full text-center mt-1 py-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50/50 rounded transition-colors"
                    >
                      Xem tất cả bài tập
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Main Announcements feed */}
        <div className={`${isStudent ? 'md:col-span-3' : 'md:col-span-4'} space-y-5`}>
          {/* Box đăng thông báo mới (chỉ dành cho giáo viên và admin) */}
          {isStaff && (
            <div className="bg-background border border-border rounded shadow-sm overflow-hidden transition-all duration-300">
              {!isComposerExpanded ? (
                <div
                  onClick={() => setIsComposerExpanded(true)}
                  className="p-4 flex items-center gap-3.5 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-extrabold shadow-inner shrink-0">
                    {user?.fullName?.split(' ').slice(-1)[0][0]?.toUpperCase() ?? 'GV'}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground flex-1">
                    Thông báo điều gì đó cho lớp học của bạn...
                  </span>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handlePostAnnouncement} className="p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-inner">
                        {user?.fullName?.split(' ').slice(-1)[0][0]?.toUpperCase() ?? 'GV'}
                      </div>
                      <span className="text-xs font-bold text-foreground">{user?.fullName}</span>
                    </div>

                    <div className="flex items-center border border-border rounded overflow-hidden bg-muted/70 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleFormat('bold')}
                        className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                        title="In đậm (Ctrl+B)"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat('italic')}
                        className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                        title="In nghiêng (Ctrl+I)"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat('underline')}
                        className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                        title="Gạch chân (Ctrl+U)"
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      id="announcement-editor"
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      placeholder="Chia sẻ thông báo hoặc tài liệu thảo luận với lớp học..."
                      className="w-full min-h-[120px] p-4 text-sm rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 bg-muted/20 focus:bg-background transition-all font-medium leading-relaxed outline-none"
                      required
                      autoFocus
                    />
                    <div className="flex justify-end gap-2.5">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsComposerExpanded(false)
                          setAnnouncementContent('')
                        }}
                        className="font-bold rounded text-xs px-4 h-9 text-muted-foreground hover:text-ink-900"
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        type="submit"
                        loading={createAnnouncementMutation.isPending}
                        className="font-bold text-xs px-5 h-9 gap-1.5 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Đăng thông báo
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Loading announcements */}
          {loadingAnnouncements ? (
            <div className="bg-background border border-border/85 rounded p-20 flex justify-center items-center shadow-sm">
              <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-background border border-border border-dashed rounded p-16 text-center shadow-sm">
              <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-sm">Bảng tin chưa có thông báo nào</h3>
              <p className="text-xs text-muted-foreground mt-1">Các thông báo lớp học và bài đăng thảo luận sẽ hiển thị ở đây.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {announcements.map((ann: any) => {
                const commentVal = commentContents[ann.id] ?? ''
                const creatorInitials = ann.creatorName
                  ?.split(' ')
                  .slice(-2)
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase() ?? 'U'

                const isAuthor = ann.createdBy === user?.id
                const canDeleteAnn = isStaff || isAuthor

                return (
                  <div
                    key={ann.id}
                    className="bg-background border border-border rounded shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300/80 transition-all duration-300"
                  >
                    {/* Announcement Header */}
                    <div className="p-5 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner ${
                        ann.creatorRole === 'Admin'
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : ann.creatorRole === 'Teacher'
                          ? "bg-primary-50 text-primary-700 border border-primary-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {creatorInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-ink-900">{ann.creatorName}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ann.creatorRole === 'Admin'
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : ann.creatorRole === 'Teacher'
                              ? "bg-primary-50 text-primary-700 border border-primary-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}>
                            {ann.creatorRole === 'Admin' ? 'Admin' : ann.creatorRole === 'Teacher' ? 'Giáo viên' : 'Học viên'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold mt-1">
                          {new Date(ann.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {(canDeleteAnn || isAuthor || isAdmin) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenActionAnnId(openActionAnnId === ann.id ? null : ann.id)
                            }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-ink-900 transition-colors shrink-0"
                            title="Lựa chọn"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openActionAnnId === ann.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenActionAnnId(null)}
                              />
                              <div className="absolute right-0 mt-1.5 w-40 rounded bg-background border border-border shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                                {(isAuthor || isAdmin) && (
                                  <button
                                    onClick={() => {
                                      setOpenActionAnnId(null)
                                      setEditingAnnId(ann.id)
                                      setEditingAnnContent(ann.content)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-2"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Sửa bài viết
                                  </button>
                                )}
                                {canDeleteAnn && (
                                  <button
                                    onClick={() => {
                                      setOpenActionAnnId(null)
                                      handleDeleteAnnouncement(ann.id)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Xóa bài viết
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Announcement Content / Edit Form */}
                    <div className="px-5 pb-5 border-b border-border">
                      {editingAnnId === ann.id ? (
                        <form onSubmit={(e) => handleUpdateAnnouncement(ann.id, e)} className="space-y-3.5 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-primary-600 uppercase tracking-wider">Chế độ chỉnh sửa</span>
                            <div className="flex items-center border border-border rounded overflow-hidden bg-muted/70 p-0.5">
                              <button
                                type="button"
                                onClick={() => handleFormat('bold', `edit-editor-${ann.id}`)}
                                className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="In đậm"
                              >
                                <Bold className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat('italic', `edit-editor-${ann.id}`)}
                                className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="In nghiêng"
                              >
                                <Italic className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat('underline', `edit-editor-${ann.id}`)}
                                className="p-1.5 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="Gạch chân"
                              >
                                <Underline className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <textarea
                            id={`edit-editor-${ann.id}`}
                            value={editingAnnContent}
                            onChange={(e) => setEditingAnnContent(e.target.value)}
                            className="w-full min-h-[100px] p-3 text-sm rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 bg-muted/20 focus:bg-background transition-all font-medium leading-relaxed outline-none"
                            required
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingAnnId(null)
                                setEditingAnnContent('')
                              }}
                              className="font-bold rounded text-xs px-4 h-8 text-muted-foreground hover:text-ink-900"
                            >
                              Hủy
                            </Button>
                            <Button
                              type="submit"
                              loading={updateAnnouncementMutation.isPending}
                              className="font-bold text-xs px-5 h-8 gap-1.5 shadow-sm"
                            >
                              Lưu thay đổi
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div
                          className="text-sm text-foreground leading-relaxed whitespace-pre-line font-medium break-words text-left"
                          dangerouslySetInnerHTML={{ __html: formatContent(ann.content) }}
                        />
                      )}
                    </div>

                    {/* Comments List Section */}
                    <div className="bg-muted/50 px-5 py-4 space-y-4">
                      {ann.comments.length > 0 && (() => {
                        const rootComments = ann.comments.filter((c: any) => !c.parentCommentId)
                        const getRepliesForRoot = (rootId: string) =>
                          ann.comments.filter((c: any) => c.parentCommentId === rootId)

                        return (
                          <div className="space-y-4 border-b border-border/70 pb-4 mb-4 empty:hidden">
                            {rootComments.map((comment: any) => {
                              const cInitials = comment.creatorName
                                ?.split(' ')
                                .slice(-2)
                                .map((w: string) => w[0])
                                .join('')
                                .toUpperCase() ?? 'U'

                              const isCommentAuthor = comment.createdBy === user?.id
                              const canDeleteComment = isStaff || isCommentAuthor
                              const replies = getRepliesForRoot(comment.id)

                              return (
                                <div key={comment.id} className="space-y-3.5">
                                  {/* Root comment card */}
                                  <div className="flex items-start gap-3 group/comment text-xs">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border ${
                                      comment.creatorRole === 'Admin'
                                        ? "bg-red-50 text-red-600 border-red-100"
                                        : comment.creatorRole === 'Teacher'
                                        ? "bg-primary-50 text-primary-700 border-primary-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                    }`}>
                                      {cInitials}
                                    </div>
                                    <div className="flex-1 min-w-0 relative">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-gray-950">{comment.creatorName}</span>
                                        <span className={`text-[8px] font-bold scale-90 px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                          comment.creatorRole === 'Admin'
                                            ? "bg-red-50 text-red-600"
                                            : comment.creatorRole === 'Teacher'
                                            ? "bg-primary-50 text-primary-700"
                                            : "bg-blue-50 text-blue-600"
                                        }`}>
                                          {comment.creatorRole === 'Admin' ? 'Admin' : comment.creatorRole === 'Teacher' ? 'GV' : 'HV'}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-semibold ml-1.5">
                                          {new Date(comment.createdAt).toLocaleString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <div
                                        className="text-foreground font-medium whitespace-pre-line leading-relaxed pr-6 mt-1 break-words text-left"
                                        dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
                                      />

                                      <div className="flex items-center gap-3 mt-1 select-none">
                                        <button
                                          type="button"
                                          onClick={() => handleReplyToComment(ann.id, comment.creatorName, comment.id)}
                                          className="text-xs font-bold text-muted-foreground hover:text-primary-600 transition-colors"
                                        >
                                          Trả lời
                                        </button>
                                      </div>

                                      {canDeleteComment && (
                                        <button
                                          onClick={() => handleDeleteComment(ann.id, comment.id)}
                                          className="absolute right-0 top-0.5 opacity-0 group-hover/comment:opacity-100 hover:text-red-500 text-muted-foreground transition-opacity p-0.5 rounded"
                                          title="Xóa bình luận"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Replies container */}
                                  {replies.length > 0 && (
                                    <div className="ml-11 pl-4 border-l border-gray-250/70 space-y-3.5">
                                      {replies.map((reply: any) => {
                                        const rInitials = reply.creatorName
                                          ?.split(' ')
                                          .slice(-2)
                                          .map((w: string) => w[0])
                                          .join('')
                                          .toUpperCase() ?? 'U'

                                        const isReplyAuthor = reply.createdBy === user?.id
                                        const canDeleteReply = isStaff || isReplyAuthor

                                        return (
                                          <div key={reply.id} className="flex items-start gap-3 group/comment text-xs">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border ${
                                              reply.creatorRole === 'Admin'
                                                ? "bg-red-50 text-red-600 border-red-100"
                                                : reply.creatorRole === 'Teacher'
                                                ? "bg-primary-50 text-primary-700 border-primary-100"
                                                : "bg-blue-50 text-blue-700 border-blue-100"
                                            }`}>
                                              {rInitials}
                                            </div>
                                            <div className="flex-1 min-w-0 relative">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-gray-950">{reply.creatorName}</span>
                                                <span className={`text-[8px] font-bold scale-90 px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                                  reply.creatorRole === 'Admin'
                                                    ? "bg-red-50 text-red-600"
                                                    : reply.creatorRole === 'Teacher'
                                                    ? "bg-primary-50 text-primary-700"
                                                    : "bg-blue-50 text-blue-600"
                                                }`}>
                                                  {reply.creatorRole === 'Admin' ? 'Admin' : reply.creatorRole === 'Teacher' ? 'GV' : 'HV'}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-semibold ml-1.5">
                                                  {new Date(reply.createdAt).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </span>
                                              </div>
                                              <div
                                                className="text-foreground font-medium whitespace-pre-line leading-relaxed pr-6 mt-1 break-words text-left"
                                                dangerouslySetInnerHTML={{ __html: formatContent(reply.content) }}
                                              />

                                              {canDeleteReply && (
                                                <button
                                                  onClick={() => handleDeleteComment(ann.id, reply.id)}
                                                  className="absolute right-0 top-0.5 opacity-0 group-hover/comment:opacity-100 hover:text-red-500 text-muted-foreground transition-opacity p-0.5 rounded"
                                                  title="Xóa bình luận"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}

                      {/* Comment Composer Input */}
                      {expandedCommentAnnId === ann.id ? (
                        <form onSubmit={(e) => handlePostComment(ann.id, e)} className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-primary-600 uppercase tracking-wider">Viết bình luận</span>
                            <div className="flex items-center border border-border rounded overflow-hidden bg-muted/70 p-0.5">
                              <button
                                type="button"
                                onClick={() => handleFormat('bold', `comment-editor-${ann.id}`)}
                                className="p-1 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="In đậm"
                              >
                                <Bold className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat('italic', `comment-editor-${ann.id}`)}
                                className="p-1 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="In nghiêng"
                              >
                                <Italic className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat('underline', `comment-editor-${ann.id}`)}
                                className="p-1 hover:bg-muted/80/80 rounded text-muted-foreground hover:text-ink-900 transition-colors"
                                title="Gạch chân"
                              >
                                <Underline className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <textarea
                            id={`comment-editor-${ann.id}`}
                            value={commentVal}
                            onChange={(e) => setCommentContents(prev => ({ ...prev, [ann.id]: e.target.value }))}
                            placeholder="Viết bình luận lớp học..."
                            className="w-full min-h-[70px] p-3 text-xs rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 bg-background transition-all font-medium leading-relaxed outline-none"
                            required
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setExpandedCommentAnnId(null)
                                setReplyParentCommentId(prev => ({ ...prev, [ann.id]: null }))
                              }}
                              className="font-bold rounded text-xs px-3 h-7 text-muted-foreground hover:text-ink-900"
                            >
                              Hủy
                            </Button>
                            <Button
                              type="submit"
                              loading={createCommentMutation.isPending}
                              className="font-bold text-xs px-4 h-7 gap-1 shadow-sm"
                            >
                              <Send className="h-3 w-3" />
                              Bình luận
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={(e) => handlePostComment(ann.id, e)} className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={commentVal}
                            onChange={(e) => setCommentContents(prev => ({ ...prev, [ann.id]: e.target.value }))}
                            placeholder="Viết bình luận lớp học..."
                            className="flex-1 bg-background border border-border rounded px-4 py-2 text-xs font-semibold focus:border-primary-500 focus:ring-primary-500/20 shadow-sm h-9 outline-none transition-all text-left"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setExpandedCommentAnnId(ann.id)}
                            className="p-2.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center justify-center h-9 w-9 border border-border bg-background shadow-sm"
                            title="Mở rộng khung soạn thảo Rich Text"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                          <Button
                            type="submit"
                            size="icon"
                            loading={createCommentMutation.isPending}
                            className="w-9 h-9 shrink-0 shadow-sm hover:shadow animate-in fade-in"
                            title="Gửi bình luận"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

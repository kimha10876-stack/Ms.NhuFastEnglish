import React from 'react'
import { Clock, Send, AlertTriangle, ExternalLink, GraduationCap, Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { ClassAssignment, AssignmentSubmission, AssignmentQuestion, StudentAnswer } from '@/features/classes/classes.types'

interface AssignmentDetailModalProps {
  classId: string
  selectedAssignment: ClassAssignment | null
  onClose: () => void
  isStudent: boolean
  isStaff: boolean
  inlineSubmissionMode: 'link' | 'text'
  setInlineSubmissionMode: (mode: 'link' | 'text') => void
  inlineLinkUrl: string
  setInlineLinkUrl: (url: string) => void
  inlineTextContent: string
  setInlineTextContent: (text: string) => void
  isEditingInlineSub: boolean
  setIsEditingInlineSub: (val: boolean) => void
  handleInlineSubmit: (e: React.FormEvent) => void
  submitPending: boolean
  staffViewTab: 'submissions' | 'preview'
  setStaffViewTab: (tab: 'submissions' | 'preview') => void
  submissions: AssignmentSubmission[]
  loadingSubmissions: boolean
  handleOpenGrade: (sub: AssignmentSubmission) => void
  navigate: (path: string) => void
}

export function AssignmentDetailModal({
  classId,
  selectedAssignment,
  onClose,
  isStudent,
  isStaff,
  inlineSubmissionMode,
  setInlineSubmissionMode,
  inlineLinkUrl,
  setInlineLinkUrl,
  inlineTextContent,
  setInlineTextContent,
  isEditingInlineSub,
  setIsEditingInlineSub,
  handleInlineSubmit,
  submitPending,
  staffViewTab,
  setStaffViewTab,
  submissions,
  loadingSubmissions,
  handleOpenGrade,
  navigate,
}: AssignmentDetailModalProps) {
  if (!selectedAssignment) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-left"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <span className="text-xs font-extrabold text-primary-600 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Bài tập về nhà
            </span>
            <h2 className="font-extrabold text-lg text-ink-900 mt-1.5 leading-snug pr-4">
              {selectedAssignment.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-muted-foreground p-1.5 rounded hover:bg-muted transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Deadline & Instructions */}
          <div className="bg-muted border border-border/60 p-4 rounded space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Clock className="h-4 w-4 text-primary-500" />
              Hạn nộp:{' '}
              {selectedAssignment.dueDate ? (
                <span className="text-ink-900 font-extrabold">
                  {new Date(selectedAssignment.dueDate).toLocaleString('vi-VN')}
                </span>
              ) : (
                <span className="text-muted-foreground">Không giới hạn</span>
              )}
            </div>
            <div className="text-sm text-foreground font-semibold leading-relaxed whitespace-pre-wrap">
              {selectedAssignment.description}
            </div>
          </div>

          {/* Student Workflow: Submit homework */}
          {isStudent && (
            <div className="border-t border-border pt-5 space-y-4">
              <h3 className="font-extrabold text-sm text-ink-900 flex items-center gap-1.5">
                <Send className="h-4 w-4 text-primary-500" />
                Bài làm của bạn
              </h3>

              {/* Warning if overdue and late submission is blocked */}
              {(() => {
                const isOverdue = !!(selectedAssignment.dueDate && new Date(selectedAssignment.dueDate) < new Date())
                const isBlocked = !!(isOverdue && !selectedAssignment.allowLateSubmission)
                const hasSubmitted = !!selectedAssignment.submission

                if (isBlocked && !hasSubmitted) {
                  return (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl">
                      <p className="text-xs text-red-700 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Đã khóa nộp bài! Bài tập đã quá hạn deadline và không chấp nhận nộp trễ.
                      </p>
                    </div>
                  )
                }

                if (isOverdue && selectedAssignment.allowLateSubmission && !hasSubmitted) {
                  return (
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-3.5 rounded-r-xl">
                      <p className="text-xs text-primary-700 font-bold flex items-center gap-1.5">
                        <Clock className="h-4 w-4 shrink-0" />
                        Hạn nộp bài đã qua. Bạn vẫn có thể nộp bài nhưng sẽ bị đánh dấu là "Nộp trễ".
                      </p>
                    </div>
                  )
                }

                return null
              })()}

              {/* Grading View */}
              {selectedAssignment.submission?.grade !== null && selectedAssignment.submission?.grade !== undefined && (
                <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded flex gap-4 items-start mb-4 animate-in fade-in duration-200">
                  {selectedAssignment.assignmentType === 'Quiz' ? (
                    (() => {
                      const totalQuestions = selectedAssignment.questionsJson ? (JSON.parse(selectedAssignment.questionsJson) as any[]).length : 0
                      const correctAnswers = selectedAssignment.submission.grade
                      const percent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
                      return (
                        <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                          <span className="text-sm font-black text-emerald-800 leading-none">{correctAnswers}/{totalQuestions}</span>
                          <span className="text-[8px] font-bold text-emerald-500 tracking-wider mt-0.5">ĐÚNG</span>
                          <span className="text-[8px] font-bold text-emerald-600 tracking-wider leading-none mt-0.5">{percent}%</span>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-100 border-4 border-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-lg font-black text-emerald-800 leading-none">{selectedAssignment.submission.grade}</span>
                      <span className="text-[8px] font-bold text-emerald-500 tracking-wider">ĐIỂM</span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Kết quả & Đánh giá từ Giáo viên</h4>
                    <p className="text-sm text-emerald-700 font-semibold mt-1 leading-relaxed whitespace-pre-wrap">
                      {selectedAssignment.submission.teacherFeedback || 'Tuyệt vời! Hãy tiếp tục phát huy nhé.'}
                    </p>
                  </div>
                </div>
              )}

              {selectedAssignment.assignmentType === 'Quiz' ? (
                <Button
                  onClick={() => {
                    const url = `/classes/${classId}/assignments/${selectedAssignment.id}/do`
                    navigate(url)
                  }}
                  className="w-full gap-1.5 rounded font-extrabold py-3 shadow-md shadow-primary-500/20 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
                >
                  <Send className="h-4 w-4" />
                  {selectedAssignment.submission ? 'Xem chi tiết bài làm & Kết quả' : 'Bắt đầu làm bài trắc nghiệm (Quiz)'}
                </Button>
              ) : (
                // Upload/Essay assignment inline submission workflow
                <div className="space-y-4 pt-1">
                  {isEditingInlineSub ? (
                    <form onSubmit={handleInlineSubmit} className="space-y-4">
                      <div className="flex border border-border rounded overflow-hidden p-1 bg-muted/50">
                        <button
                          type="button"
                          onClick={() => setInlineSubmissionMode('link')}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded transition-all ${
                            inlineSubmissionMode === 'link'
                              ? 'bg-background shadow-sm text-primary-700'
                              : 'text-muted-foreground hover:text-muted-foreground'
                          }`}
                        >
                          Nộp bằng Link liên kết
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineSubmissionMode('text')
                            setInlineLinkUrl('')
                          }}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded transition-all ${
                            inlineSubmissionMode === 'text'
                              ? 'bg-background shadow-sm text-primary-700'
                              : 'text-muted-foreground hover:text-muted-foreground'
                          }`}
                        >
                          Làm trực tiếp trên Web
                        </button>
                      </div>

                      {inlineSubmissionMode === 'link' ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5 text-left">
 <label className="text-xs uppercase tracking-wider block">
                              Đường dẫn bài làm (Link Google Drive, Canva, Figma...)
                            </label>
                            <Input
                              value={inlineLinkUrl}
                              onChange={(e) => setInlineLinkUrl(e.target.value)}
                              placeholder="Dán link bài làm của bạn tại đây..."
                              className="rounded h-10 text-xs bg-background border border-border focus:border-primary-500"
                              required
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
 <label className="text-xs uppercase tracking-wider block">
                              Ghi chú hoặc lời nhắn (tùy chọn)
                            </label>
                            <textarea
                              value={inlineTextContent}
                              onChange={(e) => setInlineTextContent(e.target.value)}
                              placeholder="Nhập lời nhắn gửi giáo viên..."
                              className="w-full min-h-[90px] p-3 text-xs font-semibold bg-background rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-left">
 <label className="text-xs uppercase tracking-wider block">
                            Nội dung bài làm tự luận
                          </label>
                          <textarea
                            value={inlineTextContent}
                            onChange={(e) => setInlineTextContent(e.target.value)}
                            placeholder="Viết bài tự luận hoặc trả lời của bạn trực tiếp tại đây..."
                            className="w-full min-h-[180px] p-4 text-xs font-semibold bg-background rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20"
                            required
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {selectedAssignment.submission && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditingInlineSub(false)}
                            className="flex-1 rounded text-xs font-bold"
                          >
                            Hủy bỏ
                          </Button>
                        )}
                        <Button
                          type="submit"
                          loading={submitPending}
                          className="flex-1 text-xs font-bold"
                        >
                          Nộp bài làm
                        </Button>
                      </div>
                    </form>
                  ) : (
                    (() => {
                      const sub = selectedAssignment.submission
                      if (!sub) return null
                      return (
                        <div className="space-y-4">
                          <div className="bg-muted border border-border rounded p-4 text-left space-y-3">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                                Đã nộp bài thành công
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold">
                                {sub.submittedAt && new Date(sub.submittedAt).toLocaleString('vi-VN')}
                              </span>
                            </div>

                            {sub.fileUrl ? (
                              <div className="space-y-2.5">
                                <div className="text-xs">
                                  <span className="font-bold text-muted-foreground">Đường dẫn: </span>
                                  <a
                                    href={sub.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:underline font-bold inline-flex items-center gap-1"
                                  >
                                    Mở bài làm (Link liên kết)
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                {sub.submissionText && (
                                  <div className="text-xs text-foreground bg-background border border-border p-2.5 rounded whitespace-pre-wrap font-semibold leading-relaxed">
                                    <span className="font-bold text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                                      Ghi chú
                                    </span>
                                    {sub.submissionText}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-foreground bg-background border border-border p-3 rounded whitespace-pre-wrap font-semibold leading-relaxed max-h-[200px] overflow-y-auto">
                                <span className="font-bold text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                                  Nội dung bài làm trực tiếp
                                </span>
                                {sub.submissionText}
                              </div>
                            )}
                          </div>

                          {(!selectedAssignment.dueDate ||
                            new Date(selectedAssignment.dueDate) > new Date() ||
                            selectedAssignment.allowLateSubmission) && (
                            <Button
                              type="button"
                              onClick={() => setIsEditingInlineSub(true)}
                              className="w-full rounded text-xs font-bold bg-primary-50/50 hover:bg-primary-100/60 border border-primary-200/50 text-primary-800 transition-colors"
                            >
                              Nộp lại bài làm
                            </Button>
                          )}
                        </div>
                      )
                    })()
                  )}
                </div>
              )}
            </div>
          )}

          {/* Teacher/Admin Workflow: Manage submissions */}
          {isStaff && (
            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex border-b border-border mb-4">
                <button
                  type="button"
                  onClick={() => setStaffViewTab('submissions')}
                  className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                    staffViewTab === 'submissions'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                  }`}
                >
                  Danh sách học viên nộp bài ({submissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStaffViewTab('preview')}
                  className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                    staffViewTab === 'preview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                  }`}
                >
                  Xem trước giao diện làm bài
                </button>
              </div>

              {staffViewTab === 'preview' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-primary-50 border border-primary-200/50 p-4 rounded">
                    <p className="text-xs text-primary-800 font-bold flex items-center gap-1.5 justify-start">
                      <span className="animate-pulse">✨</span>
                      Giao diện Xem trước: Giáo viên có thể làm thử Quiz/bài tập ở đây (không lưu kết quả thật).
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const url = `/classes/${classId}/assignments/${selectedAssignment.id}/do?preview=true`
                      navigate(url)
                    }}
                    className="w-full gap-1.5 rounded font-extrabold py-3 shadow-md shadow-primary-500/20 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
                  >
                    <Send className="h-4 w-4" />
                    Làm thử bài tập
                  </Button>
                </div>
              )}

              {staffViewTab === 'submissions' && (
                <>
                  <h3 className="font-extrabold text-sm text-ink-900 flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-primary-500" />
                    Danh sách học viên nộp bài ({submissions.length})
                  </h3>

                  {loadingSubmissions ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                    </div>
                  ) : submissions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Chưa có học sinh nào nộp bài tập này.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-muted border border-border/70 p-4 rounded flex flex-col justify-between hover:border-gray-300 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap sm:flex-nowrap border-b border-border pb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border border-primary-200">
                                <span className="text-xs font-bold text-primary-700">
                                  {sub.studentName[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-ink-900">{sub.studentName}</p>
                                <p className="text-xs text-muted-foreground font-semibold mt-0.5">{sub.studentEmail}</p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                Nộp: {new Date(sub.submittedAt).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {sub.grade !== null ? (
                                selectedAssignment.assignmentType === 'Quiz' ? (
                                  (() => {
                                    const totalQuestions = selectedAssignment.questionsJson
                                      ? (JSON.parse(selectedAssignment.questionsJson) as any[]).length
                                      : 0
                                    const percent = totalQuestions > 0 ? Math.round((sub.grade / totalQuestions) * 100) : 0
                                    return (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                                        Đúng {sub.grade}/{totalQuestions} câu ({percent}%)
                                      </span>
                                    )
                                  })()
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {sub.grade} Điểm
                                  </span>
                                )
                              ) : (
                                <span className="bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  Chờ chấm
                                </span>
                              )}
                            </div>
                          </div>

                          {selectedAssignment.assignmentType === 'Quiz' && sub.answersJson ? (
                            <div className="space-y-2 mb-3 bg-background border border-border p-3 rounded">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Chi tiết bài làm Quiz
                              </p>
                              {(() => {
                                const questions: AssignmentQuestion[] = selectedAssignment.questionsJson
                                  ? JSON.parse(selectedAssignment.questionsJson)
                                  : []
                                const answers: StudentAnswer[] = JSON.parse(sub.answersJson)
                                return (
                                  <div className="space-y-2 divide-y divide-gray-50">
                                    {questions.map((q, qIdx) => {
                                      const ansObj = answers.find((ans) => ans.questionId === q.id)
                                      return (
                                        <div key={q.id} className="pt-2 text-xs">
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="font-semibold text-foreground">
                                              Câu {qIdx + 1}: {q.questionText}
                                            </span>
                                            {ansObj?.isCorrect === true && (
                                              <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded-[8px] border border-emerald-100 shrink-0">
                                                Đúng
                                              </span>
                                            )}
                                            {ansObj?.isCorrect === false && (
                                              <span className="text-red-600 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded-[8px] border border-red-100 shrink-0">
                                                Sai
                                              </span>
                                            )}
                                            {ansObj?.isCorrect === undefined && (
                                              <span className="text-muted-foreground font-bold text-xs bg-muted px-1.5 py-0.5 rounded-[8px] border border-border shrink-0">
                                                Tự luận: {ansObj?.grade === 1 ? 'Đúng / Đạt' : ansObj?.grade === 0 ? 'Sai / Chưa đạt' : 'Chờ chấm'}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-muted-foreground mt-1 font-semibold pl-2 border-l-2 border-border">
                                            Trả lời: <span className="text-foreground font-bold">{ansObj?.answerText || '(Trống)'}</span>
                                          </p>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })()}
                            </div>
                          ) : (
                            <div className="text-xs text-foreground font-semibold whitespace-pre-wrap leading-relaxed bg-background border border-border p-3 rounded mb-3">
                              {sub.submissionText}
                            </div>
                          )}

                          {sub.fileUrl && (
                            <div className="mb-3">
                              <a
                                href={sub.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-bold bg-primary-50/50 border border-primary-100 px-3 py-1 rounded"
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                {sub.fileName || 'Xem file đính kèm'}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          {sub.teacherFeedback && (
                            <div className="bg-primary-50/20 border border-primary-200/20 p-2.5 rounded text-xs text-muted-foreground mb-3 font-semibold italic">
                              GV phản hồi: {sub.teacherFeedback}
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleOpenGrade(sub)}
                              className="text-xs font-bold h-8 rounded"
                            >
                              Chấm điểm & Nhận xét
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

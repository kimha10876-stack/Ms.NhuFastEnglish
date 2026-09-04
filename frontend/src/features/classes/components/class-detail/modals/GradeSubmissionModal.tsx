import React from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/utils/cn'
import type { ClassAssignment, AssignmentSubmission, AssignmentQuestion, StudentAnswer } from '@/features/classes/classes.types'

interface GradeSubmissionModalProps {
  show: boolean
  onClose: () => void
  selectedSubmission: AssignmentSubmission | null
  selectedAssignment: ClassAssignment | null
  gradeForm: {
    grade: number
    teacherFeedback: string
    answersJson: string
  }
  setGradeForm: React.Dispatch<React.SetStateAction<{
    grade: number
    teacherFeedback: string
    answersJson: string
  }>>
  handleWritingGradeChange: (questionId: string, value: number) => void
  handleWritingFeedbackChange: (questionId: string, feedback: string) => void
  onGradeSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function GradeSubmissionModal({
  show,
  onClose,
  selectedSubmission,
  selectedAssignment,
  gradeForm,
  setGradeForm,
  handleWritingGradeChange,
  handleWritingFeedbackChange,
  onGradeSubmit,
  isPending,
}: GradeSubmissionModalProps) {
  if (!selectedSubmission) return null

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showClose
        className={cn(
          'max-h-[90vh] overflow-y-auto text-left',
          selectedAssignment?.assignmentType === 'Quiz' ? 'max-w-2xl' : 'max-w-sm',
        )}
      >
        <DialogHeader>
          <DialogTitle>Chấm điểm bài làm</DialogTitle>
          <DialogDescription>Học sinh: {selectedSubmission.studentName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onGradeSubmit} className="space-y-4 px-6 pb-6">
          {selectedAssignment?.assignmentType === 'Quiz' ? (
            <div className="space-y-4">
              <div className="bg-primary-50/50 border border-primary-100 p-3 rounded mb-4">
                {(() => {
                  const questions: AssignmentQuestion[] = selectedAssignment.questionsJson
                    ? JSON.parse(selectedAssignment.questionsJson)
                    : []
                  const totalQuestions = questions.length
                  const correctCount = gradeForm.grade
                  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
                  return (
                    <p className="text-xs text-primary-800 font-bold">
                      Số câu đúng đã chấm: <span className="text-sm font-extrabold">{correctCount}</span> / {totalQuestions} câu (Tỷ lệ đạt:{' '}
                      <span className="text-sm font-extrabold">{percent}%</span>)
                    </p>
                  )
                })()}
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {(() => {
                  const questions: AssignmentQuestion[] = selectedAssignment.questionsJson
                    ? JSON.parse(selectedAssignment.questionsJson)
                    : []
                  const answers: StudentAnswer[] = gradeForm.answersJson ? JSON.parse(gradeForm.answersJson) : []

                  return questions.map((q, idx) => {
                    const studentAnsObj = answers.find((ans) => ans.questionId === q.id)
                    const isAutoGraded =
                      q.type === 'MultipleChoice' || q.type === 'TrueFalse' || q.type === 'FillInTheBlank'

                    return (
                      <div key={q.id} className="p-3 border border-border rounded space-y-2.5 bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Câu {idx + 1}: {q.questionText}
                          </span>
                          {isAutoGraded ? (
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                studentAnsObj?.isCorrect
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0'
                                  : 'bg-red-50 text-red-700 border border-red-200 shrink-0'
                              }`}
                            >
                              {studentAnsObj?.isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                          ) : (
                            <span className="text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 px-1.5 py-0.5 rounded shrink-0">
                              GV chấm điểm
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold pl-2 border-l-2 border-border">
                          Học sinh trả lời: <span className="text-foreground font-bold">{studentAnsObj?.answerText || '(Trống)'}</span>
                        </div>

                        {!isAutoGraded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-2">
                            <div className="space-y-1">
 <label className="text-xs uppercase">Đánh giá câu trả lời</label>
                              <div className="flex gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleWritingGradeChange(q.id, 1)}
                                  className={`px-3 py-1 text-xs font-bold rounded border transition-all ${
                                    studentAnsObj?.grade === 1
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                  }`}
                                >
                                  Đúng / Đạt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleWritingGradeChange(q.id, 0)}
                                  className={`px-3 py-1 text-xs font-bold rounded border transition-all ${
                                    studentAnsObj?.grade === 0
                                      ? 'bg-red-50 text-red-700 border-red-300'
                                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                  }`}
                                >
                                  Sai / Chưa đạt
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
 <label className="text-xs uppercase">Nhận xét riêng câu này</label>
                              <Input
                                value={studentAnsObj?.teacherFeedback ?? ''}
                                onChange={(e) => handleWritingFeedbackChange(q.id, e.target.value)}
                                placeholder="Nhận xét..."
                                className="rounded h-8 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          ) : (
            // Standard File/Text Grading View
            <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Điểm số (thang điểm 10)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })}
                required
                className="rounded font-extrabold text-base"
              />
            </div>
          )}

          <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Ghi chú nhận xét chung</label>
            <textarea
              value={gradeForm.teacherFeedback}
              onChange={(e) => setGradeForm({ ...gradeForm, teacherFeedback: e.target.value })}
              placeholder="Nhận xét chung về bài làm của học sinh..."
              className="w-full min-h-[80px] p-3 text-xs rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 bg-background"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-semibold" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" loading={isPending} className="flex-1 text-xs font-semibold">
              Lưu điểm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

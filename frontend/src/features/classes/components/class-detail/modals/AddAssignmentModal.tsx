import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import type { ClassAssignment, AssignmentQuestion } from '@/features/classes/classes.types'

interface AddAssignmentModalProps {
  show: boolean
  onClose: () => void
  editingAssignment: ClassAssignment | null
  assignmentForm: {
    title: string
    description: string
    dueDate: string
    assignmentType: 'Upload' | 'Quiz'
    allowLateSubmission: boolean
  }
  setAssignmentForm: React.Dispatch<React.SetStateAction<{
    title: string
    description: string
    dueDate: string
    assignmentType: 'Upload' | 'Quiz'
    allowLateSubmission: boolean
  }>>
  assignmentQuestions: AssignmentQuestion[]
  addQuestion: () => void
  updateQuestion: (index: number, fields: Partial<AssignmentQuestion>) => void
  deleteQuestion: (index: number) => void
  onSave: (e: React.FormEvent) => void
  isPending: boolean
}

export function AddAssignmentModal({
  show,
  onClose,
  editingAssignment,
  assignmentForm,
  setAssignmentForm,
  assignmentQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  onSave,
  isPending,
}: AddAssignmentModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 bg-muted flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200 text-left">
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between shrink-0 shadow-sm">
        <h3 className="font-extrabold text-base text-foreground">
          {editingAssignment ? 'Chỉnh sửa bài tập / Quiz' : 'Giao bài tập mới / Quiz'}
        </h3>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" className="rounded px-4 py-2 text-xs font-semibold" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="button"
            onClick={(e) => onSave(e as any)}
            loading={isPending}
            className="px-4 py-2 text-xs font-semibold"
          >
            Lưu bài tập
          </Button>
        </div>
      </header>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-background border border-border rounded shadow-sm p-6 md:p-8 space-y-6">
          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Tiêu đề bài tập</label>
              <Input
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                placeholder="Ví dụ: Luyện nghe Unit 1"
                required
                className="rounded"
              />
            </div>

            <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Yêu cầu & Đề bài chi tiết</label>
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                placeholder="Mô tả các yêu cầu, các bước thực hiện của học viên..."
                className="w-full min-h-[100px] p-3 text-sm rounded-[8px] border border-border focus:border-primary-500 focus:ring-primary-500/20 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Loại bài tập</label>
                <CustomDropdown
                  value={assignmentForm.assignmentType}
                  options={[
                    { id: 'Upload', name: 'Tự luận / Tải file' },
                    { id: 'Quiz', name: 'Trắc nghiệm / Trả lời câu hỏi' }
                  ]}
                  onChange={(val) => setAssignmentForm({ ...assignmentForm, assignmentType: val as any })}
                />
              </div>

              <div className="space-y-1">
 <label className="text-xs uppercase tracking-wider">Hạn nộp (Deadline)</label>
                <Input
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="rounded"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="allowLate"
                checked={assignmentForm.allowLateSubmission}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, allowLateSubmission: e.target.checked })}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
 <label htmlFor="allowLate" className="text-xs cursor-pointer select-none">
                Cho phép nộp trễ sau deadline
              </label>
            </div>

            {/* Questions Builder if Quiz */}
            {assignmentForm.assignmentType === 'Quiz' && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">Danh sách câu hỏi ({assignmentQuestions.length})</h3>
                  <Button type="button" size="sm" onClick={addQuestion} className="text-xs font-semibold rounded gap-1">
                    <Plus className="h-3 w-3" /> Thêm câu hỏi
                  </Button>
                </div>

                {assignmentQuestions.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded text-muted-foreground text-xs">
                    Chưa có câu hỏi nào. Bấm nút trên để bắt đầu thêm câu hỏi.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {assignmentQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 border border-border rounded bg-muted/50 space-y-3 relative group/question">
                        <button
                          type="button"
                          onClick={() => deleteQuestion(idx)}
                          className="absolute right-3 top-3 p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="space-y-1">
 <label className="text-xs uppercase">Loại câu hỏi</label>
                          <CustomDropdown
                            value={q.type}
                            options={[
                              { id: 'MultipleChoice', name: 'Trắc nghiệm A/B/C/D' },
                              { id: 'TrueFalse', name: 'Đúng / Sai' },
                              { id: 'FillInTheBlank', name: 'Điền từ vào chỗ trống' },
                              { id: 'ShortAnswer', name: 'Câu trả lời ngắn' },
                              { id: 'Writing', name: 'Viết / Tự luận' }
                            ]}
                            onChange={(val) => {
                              const defaults: Partial<AssignmentQuestion> = { type: val as any }
                              if (val === 'MultipleChoice') {
                                defaults.options = ['', '', '', '']
                                defaults.correctAnswer = 'A'
                              } else if (val === 'TrueFalse') {
                                defaults.correctAnswer = 'True'
                              } else {
                                defaults.correctAnswer = ''
                              }
                              updateQuestion(idx, defaults)
                            }}
                          />
                        </div>

                        <div className="space-y-1">
 <label className="text-xs uppercase">Câu hỏi / Đề bài</label>
                          <Input
                            value={q.questionText}
                            onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                            placeholder="Nhập nội dung câu hỏi..."
                            required
                            className="rounded h-9 text-xs"
                          />
                        </div>

                        {/* Multiple Choice Options Builder */}
                        {q.type === 'MultipleChoice' && q.options && (
                          <div className="space-y-2 border-t border-border pt-2">
 <label className="text-xs uppercase">Các phương án trả lời</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                                <div key={opt} className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-muted-foreground">{opt}:</span>
                                  <Input
                                    value={q.options?.[optIdx] ?? ''}
                                    onChange={(e) => {
                                      const newOpts = [...(q.options || ['', '', '', ''])]
                                      newOpts[optIdx] = e.target.value
                                      updateQuestion(idx, { options: newOpts })
                                    }}
                                    placeholder={`Phương án ${opt}...`}
                                    required
                                    className="rounded h-8 text-xs flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1 mt-2">
 <label className="text-xs uppercase">Đáp án đúng</label>
                              <CustomDropdown
                                value={q.correctAnswer || 'A'}
                                options={[
                                  { id: 'A', name: 'A' },
                                  { id: 'B', name: 'B' },
                                  { id: 'C', name: 'C' },
                                  { id: 'D', name: 'D' }
                                ]}
                                onChange={(val) => updateQuestion(idx, { correctAnswer: val })}
                              />
                            </div>
                          </div>
                        )}

                        {/* True/False Option */}
                        {q.type === 'TrueFalse' && (
                          <div className="space-y-1 border-t border-border pt-2">
 <label className="text-xs uppercase">Đáp án đúng</label>
                            <CustomDropdown
                              value={q.correctAnswer || 'True'}
                              options={[
                                { id: 'True', name: 'Đúng (True)' },
                                { id: 'False', name: 'Sai (False)' }
                              ]}
                              onChange={(val) => updateQuestion(idx, { correctAnswer: val })}
                            />
                          </div>
                        )}

                        {/* Fill In The Blank Option */}
                        {q.type === 'FillInTheBlank' && (
                          <div className="space-y-1.5 border-t border-border pt-2 text-xs">
                            <div className="bg-blue-50/50 border border-blue-100 text-blue-800 p-3 rounded space-y-1 text-xs leading-relaxed">
                              <p className="font-extrabold text-blue-900">Hướng dẫn điền từ dạng chọn đáp án (Inline Select):</p>
                              <p>Nhập câu văn hoàn chỉnh và đặt các lựa chọn trong ngoặc vuông ngăn cách bởi dấu gạch chéo `/` (từ đầu tiên luôn là đáp án đúng).</p>
                              <p className="italic text-muted-foreground mt-1">Ví dụ: Yesterday, she <strong>[went/go/goes]</strong> to the cinema.</p>
                            </div>
                          </div>
                        )}

                        {/* Short Answer Option */}
                        {q.type === 'ShortAnswer' && (
                          <div className="space-y-1 border-t border-border pt-2">
 <label className="text-xs uppercase">Đáp án đúng tham chiếu (Không bắt buộc)</label>
                            <Input
                              value={q.correctAnswer ?? ''}
                              onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                              placeholder="Nếu có đáp án mẫu, nhập vào đây..."
                              className="rounded h-9 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

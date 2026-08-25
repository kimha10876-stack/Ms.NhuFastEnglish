import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Clock, 
  ChevronLeft, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Paperclip, 
  Loader2, 
  Sparkles, 
  BookOpen
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { classesApi } from './classes.api'
import type { ClassAssignment, AssignmentQuestion, StudentAnswer } from './classes.types'

export default function DoAssignmentPage() {
  const { assignmentId } = useParams<{ classId: string; assignmentId: string }>()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isPreview = searchParams.get('preview') === 'true'

  // States
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [submissionMode, setSubmissionMode] = useState<'link' | 'text'>('link')
  const [submitForm, setSubmitForm] = useState({
    submissionText: '',
    fileUrl: '',
    fileName: ''
  })
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  // Refs for scrolling to questions
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Fetch Assignment Details
  const { data: assignment, isLoading, error } = useQuery<ClassAssignment>({
    queryKey: ['assignment-detail', assignmentId],
    queryFn: () => classesApi.getAssignmentDetail(assignmentId!),
    enabled: !!assignmentId,
  })

  // Parse questions
  const questions: AssignmentQuestion[] = React.useMemo(() => {
    if (!assignment?.questionsJson) return []
    try {
      return JSON.parse(assignment.questionsJson)
    } catch {
      return []
    }
  }, [assignment?.questionsJson])

  // Parse submission answers
  const submissionAnswers: StudentAnswer[] = React.useMemo(() => {
    if (!assignment?.submission?.answersJson) return []
    try {
      return JSON.parse(assignment.submission.answersJson)
    } catch {
      return []
    }
  }, [assignment?.submission?.answersJson])

  // Setup answers on load
  useEffect(() => {
    if (assignment) {
      // Normal assignment submission state
      setSubmitForm({
        submissionText: assignment.submission?.submissionText ?? '',
        fileUrl: assignment.submission?.fileUrl ?? '',
        fileName: assignment.submission?.fileName ?? ''
      })

      if (assignment.submission?.fileUrl) {
        setSubmissionMode('link')
      } else if (assignment.submission?.submissionText) {
        setSubmissionMode('text')
      } else {
        setSubmissionMode('link')
      }

      // Quiz answers state
      if (assignment.assignmentType === 'Quiz' && assignment.submission?.answersJson) {
        try {
          const answers: StudentAnswer[] = JSON.parse(assignment.submission.answersJson)
          const answerMap: Record<string, string> = {}
          answers.forEach((ans) => {
            answerMap[ans.questionId] = ans.answerText
          })
          setQuizAnswers(answerMap)
        } catch {
          setQuizAnswers({})
        }
      } else {
        setQuizAnswers({})
      }
    }
  }, [assignment])

  // Live Timer Countdown
  useEffect(() => {
    if (!assignment?.dueDate) {
      setTimeLeft('Không giới hạn thời gian')
      return
    }

    const timer = setInterval(() => {
      const diff = new Date(assignment.dueDate!).getTime() - new Date().getTime()
      if (diff <= 0) {
        setTimeLeft('Đã hết hạn nộp bài')
        clearInterval(timer)
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const mins = Math.floor((diff / (1000 * 60)) % 60)
        const secs = Math.floor((diff / 1000) % 60)
        
        let display = ''
        if (days > 0) display += `${days} ngày `
        display += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        setTimeLeft(display)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [assignment?.dueDate])

  // Submit Homework Mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: (body: { submissionText?: string; fileUrl?: string; fileName?: string; answersJson?: string }) =>
      classesApi.submitAssignment(assignmentId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-detail', assignmentId] })
      alert('Nộp bài tập thành công!')
    },
    onError: () => {
      alert('Có lỗi xảy ra, vui lòng nộp lại bài!')
    }
  })

  // Submit Logic
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (isPreview) {
      alert('Xem trước: Gửi bài thành công! Trong thực tế, hệ thống sẽ ghi nhận và tự động chấm điểm các câu trắc nghiệm.')
      return
    }

    const isOverdue = !!(assignment?.dueDate && new Date(assignment.dueDate) < new Date())
    const isBlocked = !!(isOverdue && !assignment?.allowLateSubmission)
    if (isBlocked) {
      alert('Hạn nộp bài đã khóa! Bạn không thể nộp bài tập này.')
      return
    }

    if (assignment?.assignmentType === 'Quiz') {
      const payload: StudentAnswer[] = questions.map((q) => {
        const studentAns = quizAnswers[q.id] ?? ''
        return {
          questionId: q.id,
          answerText: studentAns,
          points: q.points,
          isCorrect: undefined // Backend handles auto-grading for MCQs
        }
      })
      submitAssignmentMutation.mutate({
        answersJson: JSON.stringify(payload)
      })
    } else {
      submitAssignmentMutation.mutate({
        submissionText: submitForm.submissionText,
        fileUrl: submitForm.fileUrl,
        fileName: submitForm.fileName
      })
    }
  }

  // Scroll to question
  const scrollToQuestion = (id: string) => {
    setActiveQuestionId(id)
    const element = questionRefs.current[id]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-semibold text-gray-500">Đang tải bài tập...</p>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-base font-bold text-gray-800">Không tìm thấy thông tin bài tập</p>
        <p className="text-xs text-gray-500 mt-1">Bài tập không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl font-bold">Quay lại</Button>
      </div>
    )
  }

  const hasSubmitted = isPreview ? false : !!assignment.submission
  const isOverdue = isPreview ? false : !!(assignment.dueDate && new Date(assignment.dueDate) < new Date())
  const isBlocked = isPreview ? false : !!(isOverdue && !assignment.allowLateSubmission && !hasSubmitted)
  const isGraded = isPreview ? false : assignment.submission?.grade !== null && assignment.submission?.grade !== undefined

  // Calculate answered count
  const answeredCount = questions.filter((q) => !!quizAnswers[q.id]).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
      
      {/* ── 1. TOP HEADER BAR ── */}
      <header className="bg-slate-900 text-white py-3.5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Quay lại lớp học"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider">
                {assignment.assignmentType}
              </span>
              {isPreview && (
                <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Xem trước
                </span>
              )}
            </div>
            <h1 className="font-extrabold text-sm md:text-base text-white mt-0.5 truncate max-w-sm md:max-w-xl">
              {assignment.title}
            </h1>
          </div>
        </div>

        {/* Live Timer Widget */}
        <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/80 px-4 py-1.5 rounded-2xl">
          <Clock className={`h-4.5 w-4.5 \${isOverdue && !hasSubmitted ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Thời gian còn lại</p>
            <p className={`text-xs font-black tracking-wide \${isOverdue && !hasSubmitted ? 'text-red-500' : 'text-amber-400'}`}>
              {timeLeft}
            </p>
          </div>
        </div>
      </header>

      {/* ── 2. DEDICATED FULL SCREEN GRID LAYOUT ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Question Navigator (Quiz only) or Instructions Panel */}
        <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Class Assignment Info */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider">Mô tả bài tập</h2>
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl text-xs text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap">
                {assignment.description || 'Không có hướng dẫn thêm.'}
              </div>
            </div>

            {/* Quiz Progress Navigator */}
            {assignment.assignmentType === 'Quiz' && questions.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider">Tiến độ làm bài</h2>
                  <span className="text-[11px] font-bold text-slate-500">
                    {answeredCount} / {questions.length} câu
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>

                {/* Grid layout for question numbers */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {questions.map((q, idx) => {
                    const isAnswered = !!quizAnswers[q.id]
                    const isActive = activeQuestionId === q.id
                    
                    let bgClass = 'border-gray-200 text-gray-500 hover:border-gray-400'
                    if (isAnswered) bgClass = 'bg-amber-50 border-amber-400 text-amber-700 font-black'
                    if (isActive) bgClass = 'bg-slate-900 border-slate-900 text-white font-black scale-105 shadow-sm'

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(q.id)}
                        className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Warnings and Overdue banners */}
            {isBlocked && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl">
                <p className="text-xs text-red-700 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Đã quá hạn và bị khóa nộp bài.
                </p>
              </div>
            )}
            
            {isOverdue && assignment.allowLateSubmission && !hasSubmitted && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-xl">
                <p className="text-xs text-amber-700 font-bold flex items-center gap-1.5 leading-relaxed">
                  <Clock className="h-4 w-4 shrink-0" />
                  Quá hạn nộp bài. Bài làm sẽ được gắn nhãn "Nộp trễ".
                </p>
              </div>
            )}

            {/* Grade Result Banner */}
            {isGraded && assignment.submission && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex gap-3.5 items-start">
                {assignment.assignmentType === 'Quiz' ? (
                  (() => {
                    const totalQuestions = questions.length
                    const correctAnswers = assignment.submission.grade ?? 0
                    const percent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
                    return (
                      <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-sm font-black text-emerald-800 leading-none">{correctAnswers}/{totalQuestions}</span>
                        <span className="text-[7px] font-bold text-emerald-500 tracking-wider mt-0.5">CÂU ĐÚNG</span>
                        <span className="text-[8px] font-bold text-emerald-600 leading-none mt-0.5">{percent}%</span>
                      </div>
                    )
                  })()
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-base font-black text-emerald-800 leading-none">{assignment.submission.grade}</span>
                    <span className="text-[7px] font-bold text-emerald-500 tracking-wider">ĐIỂM</span>
                  </div>
                )}
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Kết quả chấm</h4>
                  <p className="text-xs text-emerald-700 font-semibold mt-1 leading-relaxed">
                    {assignment.submission.teacherFeedback || 'Tuyệt vời!'}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Large Submit CTA Button */}
          {(!hasSubmitted || assignment.submission?.grade === null) && !isBlocked && (
            <div className="pt-6 border-t border-gray-100 mt-6 shrink-0">
              <Button 
                onClick={() => handleSubmit()} 
                disabled={submitAssignmentMutation.isPending} 
                className="w-full gap-1.5 rounded-xl font-bold py-3 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              >
                {submitAssignmentMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {hasSubmitted ? 'Cập nhật bài nộp' : 'Nộp bài làm'}
              </Button>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: Question and Answers Content Feed (Scrollable) */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* If the assignment is Quiz style */}
            {assignment.assignmentType === 'Quiz' ? (
              <div className="space-y-5">
                {questions.map((q, idx) => {
                  const studentAns = quizAnswers[q.id] ?? ''
                  const savedAnsObj = submissionAnswers.find(sa => sa.questionId === q.id)
                  const isCorrect = savedAnsObj?.isCorrect
                  const questionGrade = savedAnsObj?.grade
                  const isActive = activeQuestionId === q.id

                  return (
                    <div 
                      key={q.id} 
                      ref={(el) => { questionRefs.current[q.id] = el }}
                      className={`p-5 bg-white border rounded-2xl space-y-4 shadow-sm transition-all duration-300 ${
                        isActive ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-200'
                      }`}
                    >
                      {/* Question Header & Scores */}
                      <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Câu {idx + 1}
                          </span>
                        </div>

                        {/* Grading Indicator */}
                        {hasSubmitted && (
                          <div className="shrink-0 text-[10px] font-bold">
                            {isCorrect === true && (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đúng
                              </span>
                            )}
                            {isCorrect === false && (
                              <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5 text-red-500" /> Sai
                              </span>
                            )}
                            {isCorrect === undefined && (
                              <span className="text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                                {isGraded ? (questionGrade === 1 ? 'Đúng / Đạt' : 'Sai / Chưa đạt') : 'Chờ giáo viên chấm'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Question Text */}
                      <h3 className="font-extrabold text-sm text-gray-800 leading-relaxed text-left">
                        {q.questionText}
                      </h3>

                      {/* Interactive Answer Choices */}
                      {q.type === 'MultipleChoice' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {['A', 'B', 'C', 'D'].map((choice, oIdx) => {
                            const optionText = q.options?.[oIdx] || ''
                            const isSelected = studentAns === choice
                            const optionId = `q-${q.id}-${choice}`
                            
                            let choiceStyle = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50/50'
                            if (isSelected) choiceStyle = 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-sm'
                            
                            // Highlight correct/incorrect answers for submitted view
                            if (hasSubmitted) {
                              const isCorrectAnswer = q.correctAnswer === choice
                              if (isCorrectAnswer) {
                                choiceStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                              } else if (isSelected && !isCorrectAnswer) {
                                choiceStyle = 'border-red-500 bg-red-50/70 text-red-950'
                              }
                            }

                            return (
                              <label
                                key={choice}
                                htmlFor={optionId}
                                className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${choiceStyle}`}
                              >
                                <input
                                  type="radio"
                                  id={optionId}
                                  name={`q-${q.id}`}
                                  value={choice}
                                  checked={isSelected}
                                  disabled={hasSubmitted || isBlocked}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: choice })}
                                  className="accent-amber-500 mt-0.5"
                                />
                                <span className="font-extrabold shrink-0">{choice}.</span>
                                <span className="leading-relaxed text-left">{optionText}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {q.type === 'TrueFalse' && (
                        <div className="flex gap-4">
                          {['True', 'False'].map((choice) => {
                            const isSelected = studentAns === choice
                            const optionId = `q-${q.id}-${choice}`
                            
                            let choiceStyle = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50/50'
                            if (isSelected) {
                              choiceStyle = choice === 'True' 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                                : 'border-red-500 bg-red-50 text-red-800 shadow-sm'
                            }

                            if (hasSubmitted) {
                              const isCorrectAnswer = q.correctAnswer === choice
                              if (isCorrectAnswer) {
                                choiceStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              } else if (isSelected && !isCorrectAnswer) {
                                choiceStyle = 'border-red-500 bg-red-50 text-red-800'
                              }
                            }

                            return (
                              <label
                                key={choice}
                                htmlFor={optionId}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${choiceStyle}`}
                              >
                                <input
                                  type="radio"
                                  id={optionId}
                                  name={`q-${q.id}`}
                                  value={choice}
                                  checked={isSelected}
                                  disabled={hasSubmitted || isBlocked}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: choice })}
                                  className="accent-amber-500"
                                />
                                {choice === 'True' ? 'Đúng' : 'Sai'}
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {q.type === 'FillInTheBlank' && (
                        <div className="space-y-1.5">
                          <Input
                            value={studentAns}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                            disabled={hasSubmitted || isBlocked}
                            placeholder="Nhập câu trả lời hoặc từ cần điền..."
                            className="rounded-2xl h-11 text-xs bg-white border border-gray-200"
                          />
                          {hasSubmitted && (
                            <p className="text-[10px] font-bold text-gray-400 text-left">
                              Đáp án đúng của giáo viên: <span className="text-emerald-700">{q.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {q.type === 'ShortAnswer' && (
                        <div className="space-y-1.5">
                          <Input
                            value={studentAns}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                            disabled={hasSubmitted || isBlocked}
                            placeholder="Nhập câu trả lời ngắn..."
                            className="rounded-2xl h-11 text-xs bg-white border border-gray-200"
                          />
                          {hasSubmitted && (
                            <p className="text-[10px] font-bold text-gray-400 text-left">
                              Đáp án mẫu: <span className="text-emerald-700">{q.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {q.type === 'Writing' && (
                        <textarea
                          value={studentAns}
                          onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                          disabled={hasSubmitted || isBlocked}
                          placeholder="Viết bài làm tự luận của bạn tại đây..."
                          className="w-full min-h-[140px] p-4 text-xs font-medium rounded-2xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                        />
                      )}

                      {/* Instructor feedback for specific question */}
                      {savedAnsObj?.teacherFeedback && (
                        <div className="bg-amber-50/40 border border-amber-200/20 p-3 rounded-2xl text-[11px] text-gray-600 font-semibold italic text-left flex items-start gap-2">
                          <span className="font-bold text-amber-600 shrink-0">Nhận xét của GV:</span>
                          <span>{savedAnsObj.teacherFeedback}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // Standard Link Submission or Text Writing layout
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-4 justify-start">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-gray-800">
                    {hasSubmitted 
                      ? (submitForm.fileUrl ? 'Bài làm: Link liên kết' : 'Bài làm: Tự luận trên web')
                      : 'Nộp bài tập tự luận'
                    }
                  </h3>
                </div>

                {/* Choice Toggle Buttons */}
                {!hasSubmitted && !isBlocked && (
                  <div className="flex border border-gray-200 rounded-2xl overflow-hidden p-1 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => setSubmissionMode('link')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                        submissionMode === 'link'
                          ? 'bg-white shadow-sm text-amber-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Nộp bằng Link liên kết
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionMode('text')
                        setSubmitForm(prev => ({ ...prev, fileUrl: '', fileName: '' }))
                      }}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                        submissionMode === 'text'
                          ? 'bg-white shadow-sm text-amber-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Làm trực tiếp trên Web
                    </button>
                  </div>
                )}

                {/* Rendering Link submission inputs */}
                {(hasSubmitted ? !!submitForm.fileUrl : submissionMode === 'link') ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block text-left">Ghi chú hoặc nội dung bài làm</label>
                      <textarea
                        value={submitForm.submissionText}
                        onChange={(e) => setSubmitForm({ ...submitForm, submissionText: e.target.value })}
                        placeholder="Nhập ghi chú hoặc lời nhắn gửi giáo viên (tùy chọn)..."
                        className="w-full min-h-[140px] p-4 text-sm font-medium bg-white rounded-2xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-left"
                        disabled={hasSubmitted || isBlocked}
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">Đường dẫn bài làm (Link Google Drive, Canva, Figma...)</label>
                      <Input
                        value={submitForm.fileUrl}
                        onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value, fileName: e.target.value ? 'Link bài làm' : '' })}
                        placeholder="https://docs.google.com/document/d/... hoặc các đường dẫn khác"
                        className="rounded-2xl h-11 text-xs bg-white border border-gray-200 focus:border-amber-500"
                        required
                        disabled={hasSubmitted || isBlocked}
                      />
                    </div>
                  </div>
                ) : (
                  // Rendering Text writing response
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider block text-left">Nội dung bài làm tự luận</label>
                    <textarea
                      value={submitForm.submissionText}
                      onChange={(e) => setSubmitForm({ ...submitForm, submissionText: e.target.value })}
                      placeholder="Viết bài tự luận hoặc câu trả lời của bạn trực tiếp tại đây..."
                      className="w-full min-h-[260px] p-4 text-sm font-medium bg-white rounded-2xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-left"
                      required
                      disabled={hasSubmitted || isBlocked}
                    />
                  </div>
                )}

                {/* Show submitted link if submitted in link mode */}
                {submitForm.fileUrl && hasSubmitted && (
                  <div className="pt-2 text-left">
                    <a 
                      href={submitForm.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold bg-amber-50/50 border border-amber-100 px-3.5 py-1.5 rounded-xl transition-all"
                    >
                      <Paperclip className="h-4 w-4" />
                      Mở bài làm (Link liên kết)
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </main>

      </div>

    </div>
  )
}

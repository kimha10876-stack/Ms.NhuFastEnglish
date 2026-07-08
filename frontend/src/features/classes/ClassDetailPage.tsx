import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Info, Trash2, Plus, Copy, Link2,
  Loader2, Check, AlertTriangle, Search, Edit2,
  ChevronLeft, ChevronRight, BookOpen, FileText, Calendar,
  Clock, Sparkles,
  Paperclip, ExternalLink, Send, Download, PlusCircle,
  GraduationCap, File, CheckSquare, Upload
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  useClassDetail, useUpdateClass, useDeleteClass,
  useAddMember, useRemoveMember, useCreateInvite, useSearchStudents,
  useActiveInvite, useRevokeInvite,
  useClassSessions, useCreateSession, useUpdateSession, useDeleteSession,
  useCreateDocument, useDeleteDocument,
  useClassAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment,
  useAssignmentSubmissions, useSubmitAssignment, useGradeSubmission
} from './useClasses'
import type { UpdateClassRequest, ClassSession, ClassAssignment, AssignmentSubmission, AssignmentQuestion, StudentAnswer } from './classes.types'
import TeacherSelect from './TeacherSelect'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { classesApi } from './classes.api'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

type Tab = 'lessons' | 'assignments' | 'members' | 'info'

const STATUS_OPTIONS = ['active', 'paused', 'ended']
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended:  'Đã kết thúc',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  ended:  'bg-gray-100 text-gray-500 border-gray-200',
}

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const isStudent    = user?.roles.includes('Student') ?? false
  const isAdmin      = user?.roles.includes('Admin') ?? false
  const isTeacher    = user?.roles.includes('Teacher') ?? false
  const isStaff      = isAdmin || isTeacher

  // Default tab is 'lessons' (Units & Documents)
  const [tab, setTab]               = useState<Tab>('lessons')
  const [showAddMember, setShowAdd] = useState(false)
  const [searchQ, setSearchQ]       = useState('')
  const [addError, setAddError]     = useState('')
  const [expiryDays, setExpiryDays] = useState(30)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied]         = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [memberPage, setMemberPage] = useState(1)

  // Sessions and Documents states
  const [showAddSession, setShowAddSession] = useState(false)
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null)
  const [sessionForm, setSessionForm] = useState({
    sessionNumber: 1,
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:30',
    topic: '',
    note: ''
  })
  
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [selectedSessionForDoc, setSelectedSessionForDoc] = useState<string | null>(null) // null = tài liệu chung
  const [docForm, setDocForm] = useState({
    title: '',
    fileUrl: '',
    fileType: 'pdf',
    fileSizeKb: 100
  })

  // Assignments states
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ClassAssignment | null>(null)
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignmentType: 'Upload' as 'Upload' | 'Quiz',
    allowLateSubmission: true
  })
  const [assignmentQuestions, setAssignmentQuestions] = useState<AssignmentQuestion[]>([])

  const addQuestion = () => {
    const newQ: AssignmentQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'MultipleChoice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      points: 2
    }
    setAssignmentQuestions([...assignmentQuestions, newQ])
  }

  const updateQuestion = (index: number, fields: Partial<AssignmentQuestion>) => {
    const newQs = [...assignmentQuestions]
    newQs[index] = { ...newQs[index], ...fields } as AssignmentQuestion
    setAssignmentQuestions(newQs)
  }

  const deleteQuestion = (index: number) => {
    const newQs = assignmentQuestions.filter((_, idx) => idx !== index)
    setAssignmentQuestions(newQs)
  }

  const [selectedAssignment, setSelectedAssignment] = useState<ClassAssignment | null>(null)
  const [submitForm, setSubmitForm] = useState({
    submissionText: '',
    fileUrl: '',
    fileName: ''
  })
  
  // Trạng thái làm bài Quiz
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [uploadingFile, setUploadingFile] = useState(false)

  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null)
  const [gradeForm, setGradeForm] = useState({
    grade: 10,
    teacherFeedback: '',
    answersJson: ''
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const [editForm, setEditForm]     = useState<UpdateClassRequest | null>(null)
  const [editError, setEditError]   = useState('')

  // Query Hooks
  const { data: cls, isLoading: loadingClass }       = useClassDetail(id)
  const { mutate: update, isPending: updating }      = useUpdateClass(id)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass()
  const { mutate: addMember, isPending: adding }     = useAddMember(id)
  const { mutate: removeMember }                     = useRemoveMember(id)
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite()
  const { data: searchResults = [] }                 = useSearchStudents(searchQ)
  const { data: activeInvite }                       = useActiveInvite(id)
  const { mutate: revokeInvite, isPending: revokingInvite } = useRevokeInvite(id)

  // Sessions and Assignments Query Hooks
  const { data: sessionData, isLoading: loadingSessions } = useClassSessions(id)
  const { data: assignments = [], isLoading: loadingAssignments } = useClassAssignments(id)
  
  const createSessionMutation = useCreateSession(id)
  const updateSessionMutation = useUpdateSession(id)
  const deleteSessionMutation = useDeleteSession(id)
  
  const createDocMutation = useCreateDocument(id)
  const deleteDocMutation = useDeleteDocument(id)
  
  const createAssignmentMutation = useCreateAssignment(id)
  const updateAssignmentMutation = useUpdateAssignment(id)
  const deleteAssignmentMutation = useDeleteAssignment(id)
  
  const submitAssignmentMutation = useSubmitAssignment(id, selectedAssignment?.id ?? '')
  const gradeSubmissionMutation = useGradeSubmission(id, selectedAssignment?.id ?? '')
  
  const { data: submissions = [], isLoading: loadingSubmissions } = useAssignmentSubmissions(selectedAssignment?.id ?? '')

  const sessions = sessionData?.sessions ?? []
  const generalDocuments = sessionData?.generalDocuments ?? []

  const MEMBER_PAGE_SIZE = 10
  const totalMembers = cls?.members.length ?? 0
  const totalMemberPages = Math.ceil(totalMembers / MEMBER_PAGE_SIZE)
  const activeMemberPage = Math.min(Math.max(1, memberPage), Math.max(1, totalMemberPages))
  const paginatedMembers = cls?.members.slice(
    (activeMemberPage - 1) * MEMBER_PAGE_SIZE,
    activeMemberPage * MEMBER_PAGE_SIZE
  ) ?? []

  const handleDelete = () => {
    if (!window.confirm('Bạn có chắc muốn xoá lớp học này?')) return
    deleteClass(id, { onSuccess: () => navigate('/classes') })
  }

  const handleAddMember = (studentId: string) => {
    setAddError('')
    addMember(studentId, {
      onSuccess: () => { setShowAdd(false); setSearchQ('') },
      onError: (err: any) => {
        const msg = err?.response?.data?.message
        setAddError(msg ?? 'Thêm học sinh thất bại')
      },
    })
  }

  const handleInvite = () => {
    createInvite({ classId: id, expiryDays }, {
      onSuccess: () => {
        setShowInvite(false)
      },
    })
  }

  const startEdit = () => {
    if (!cls) return
    setEditForm({
      name: cls.name, categoryId: cls.categoryId, teacherId: cls.teacherId,
      status: cls.status, scheduleDays: cls.scheduleDays ?? '', scheduleTime: cls.scheduleTime ?? '',
      room: cls.room ?? '', note: cls.note ?? '', maxStudents: cls.maxStudents ?? undefined,
      endDate: cls.endDate ?? undefined,
    })
  }

  const handleUpdate = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!editForm) return
    setEditError('')
    update(editForm, {
      onSuccess: () => setEditForm(null),
      onError: (err: any) => {
        const msg = err?.response?.data?.message
        setEditError(msg ?? 'Cập nhật thất bại')
      },
    })
  }

  // Session handlers
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSession) {
      updateSessionMutation.mutate({
        sessionId: editingSession.id,
        body: {
          sessionNumber: sessionForm.sessionNumber,
          sessionDate: sessionForm.sessionDate,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          topic: sessionForm.topic,
          note: sessionForm.note,
        }
      }, {
        onSuccess: () => {
          setEditingSession(null)
          setShowAddSession(false)
        }
      })
    } else {
      createSessionMutation.mutate(sessionForm, {
        onSuccess: () => {
          setShowAddSession(false)
        }
      })
    }
  }

  const handleOpenAddSession = () => {
    setEditingSession(null)
    setSessionForm({
      sessionNumber: sessions.length + 1,
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:30',
      topic: '',
      note: ''
    })
    setShowAddSession(true)
  }

  const handleOpenEditSession = (s: ClassSession) => {
    setEditingSession(s)
    setSessionForm({
      sessionNumber: s.sessionNumber,
      sessionDate: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      topic: s.topic ?? '',
      note: s.note ?? ''
    })
    setShowAddSession(true)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa buổi học này và tất cả tài liệu đính kèm?')) return
    deleteSessionMutation.mutate(sessionId)
  }

  // Document handlers
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault()
    createDocMutation.mutate({
      ...docForm,
      sessionId: selectedSessionForDoc ?? undefined
    }, {
      onSuccess: () => {
        setShowAddDoc(false)
        setDocForm({
          title: '',
          fileUrl: '',
          fileType: 'pdf',
          fileSizeKb: 100
        })
      }
    })
  }

  const handleDeleteDoc = (docId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return
    deleteDocMutation.mutate(docId)
  }

  // Assignment handlers
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    const questionsJson = assignmentForm.assignmentType === 'Quiz' ? JSON.stringify(assignmentQuestions) : null

    if (editingAssignment) {
      updateAssignmentMutation.mutate({
        assignmentId: editingAssignment.id,
        body: {
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toISOString() : null,
          assignmentType: assignmentForm.assignmentType,
          allowLateSubmission: assignmentForm.allowLateSubmission,
          questionsJson: questionsJson ?? undefined
        }
      }, {
        onSuccess: () => {
          setEditingAssignment(null)
          setShowAddAssignment(false)
        }
      })
    } else {
      createAssignmentMutation.mutate({
        title: assignmentForm.title,
        description: assignmentForm.description,
        dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toISOString() : undefined,
        assignmentType: assignmentForm.assignmentType,
        allowLateSubmission: assignmentForm.allowLateSubmission,
        questionsJson: questionsJson ?? undefined
      }, {
        onSuccess: () => {
          setShowAddAssignment(false)
        }
      })
    }
  }

  const handleOpenAddAssignment = () => {
    setEditingAssignment(null)
    setAssignmentQuestions([])
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      assignmentType: 'Upload',
      allowLateSubmission: true
    })
    setShowAddAssignment(true)
  }

  const handleOpenEditAssignment = (a: ClassAssignment, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAssignment(a)
    setAssignmentQuestions(a.questionsJson ? JSON.parse(a.questionsJson) : [])
    setAssignmentForm({
      title: a.title,
      description: a.description,
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '',
      assignmentType: a.assignmentType || 'Upload',
      allowLateSubmission: a.allowLateSubmission !== false
    })
    setShowAddAssignment(true)
  }

  const handleDeleteAssignment = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Bạn có chắc muốn xóa bài tập này?')) return
    deleteAssignmentMutation.mutate(assignmentId)
  }

  // Student Submit handler
  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    let answersJson = ''
    if (selectedAssignment.assignmentType === 'Quiz') {
      const questions: AssignmentQuestion[] = selectedAssignment.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
      const studentAnswers = questions.map((q) => ({
        questionId: q.id,
        answerText: quizAnswers[q.id] ?? ''
      }))
      answersJson = JSON.stringify(studentAnswers)
    }

    submitAssignmentMutation.mutate({
      submissionText: selectedAssignment.assignmentType === 'Quiz' ? 'Bài làm Trắc nghiệm/Quiz trực tuyến' : submitForm.submissionText,
      fileUrl: selectedAssignment.assignmentType === 'Quiz' ? undefined : submitForm.fileUrl,
      fileName: selectedAssignment.assignmentType === 'Quiz' ? undefined : submitForm.fileName,
      answersJson: selectedAssignment.assignmentType === 'Quiz' ? answersJson : undefined
    }, {
      onSuccess: () => {
        // Refetch chi tiết bài tập để cập nhật điểm tự chấm và kết quả nộp bài
        classesApi.getAssignmentDetail(selectedAssignment.id).then((updatedAssign) => {
          setSelectedAssignment(updatedAssign)
          alert('Nộp bài làm thành công!')
        }).catch(() => {
          alert('Nộp bài làm thành công! (Vui lòng tải lại trang để xem kết quả)')
        })
      }
    })
  }

  const handleWritingGradeChange = (questionId: string, value: number) => {
    const currentAnswers = gradeForm.answersJson ? JSON.parse(gradeForm.answersJson) as StudentAnswer[] : []
    const updated = currentAnswers.map((ans) => {
      if (ans.questionId === questionId) {
        return { ...ans, grade: value }
      }
      return ans
    })

    // Tính lại tổng điểm
    const questions: AssignmentQuestion[] = selectedAssignment?.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
    let totalGrade = 0
    updated.forEach((ans) => {
      const q = questions.find((question) => question.id === ans.questionId)
      if (q) {
        if (q.type === 'MultipleChoice' || q.type === 'TrueFalse' || q.type === 'FillInTheBlank') {
          if (ans.isCorrect) totalGrade += q.points
        } else {
          totalGrade += ans.grade ?? 0
        }
      }
    })

    setGradeForm((prev) => ({
      ...prev,
      grade: Number(totalGrade.toFixed(2)),
      answersJson: JSON.stringify(updated)
    }))
  }

  const handleWritingFeedbackChange = (questionId: string, feedback: string) => {
    const currentAnswers = gradeForm.answersJson ? JSON.parse(gradeForm.answersJson) as StudentAnswer[] : []
    const updated = currentAnswers.map((ans) => {
      if (ans.questionId === questionId) {
        return { ...ans, teacherFeedback: feedback }
      }
      return ans
    })

    setGradeForm((prev) => ({
      ...prev,
      answersJson: JSON.stringify(updated)
    }))
  }

  // Teacher Grade handler
  const handleGradeSub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return
    gradeSubmissionMutation.mutate({
      submissionId: selectedSubmission.id,
      body: {
        grade: gradeForm.grade,
        teacherFeedback: gradeForm.teacherFeedback,
        answersJson: gradeForm.answersJson || undefined
      }
    }, {
      onSuccess: () => {
        setShowGradeModal(false)
        setSelectedSubmission(null)
        // Refetch lại selectedAssignment để cập nhật danh sách bài nộp mới nhất
        if (selectedAssignment) {
          classesApi.getAssignmentDetail(selectedAssignment.id).then((updatedAssign) => {
            setSelectedAssignment(updatedAssign)
          })
        }
        alert('Chấm điểm thành công!')
      }
    })
  }

  const handleOpenGrade = (sub: AssignmentSubmission) => {
    setSelectedSubmission(sub)
    setGradeForm({
      grade: sub.grade ?? 10,
      teacherFeedback: sub.teacherFeedback ?? '',
      answersJson: sub.answersJson ?? ''
    })
    setShowGradeModal(true)
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    if (type.includes('word') || type.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />
    if (type.includes('ppt')) return <FileText className="h-5 w-5 text-orange-500" />
    if (type.includes('youtube') || type.includes('video') || type.includes('mp4')) return <File className="h-5 w-5 text-rose-600" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  if (loadingClass) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-56 bg-gray-100 animate-pulse rounded-xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500">Không tìm thấy lớp học</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/classes')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/classes')}
          className="mt-0.5 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: cls.categoryColorHex }}
            >
              {cls.categoryName}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
              {STATUS_LABEL[cls.status] ?? cls.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate">{cls.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Giáo viên: {cls.teacherName}</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-0.5 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Xoá lớp học"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            tab === 'lessons'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Bài học & Tài liệu
        </button>
        <button
          onClick={() => setTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            tab === 'assignments'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          Bài tập về nhà
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${tab === 'assignments' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {assignments.length}
          </span>
        </button>
        <button
          onClick={() => setTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            tab === 'members'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Thành viên
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${tab === 'members' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {cls.members.length}
          </span>
        </button>
        <button
          onClick={() => setTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            tab === 'info'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Info className="h-4 w-4" />
          Thông tin lớp
        </button>
      </div>

      {/* ── 1. Lessons tab ── */}
      {tab === 'lessons' && (
        <div className="space-y-6">
          {/* Header Actions */}
          {isStaff && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              <Button size="sm" onClick={handleOpenAddSession} className="gap-1.5 text-xs font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Thêm buổi học (Unit)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setSelectedSessionForDoc(null); setShowAddDoc(true); }} className="gap-1.5 text-xs font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Thêm tài liệu chung
              </Button>
            </div>
          )}

          {/* General Documents Box */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3.5 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Tài liệu & Giáo trình chung của lớp
            </h3>
            {generalDocuments.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium italic">Lớp học chưa có tài liệu chung.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {generalDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200 group">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-amber-600 transition-colors">
                      {getFileIcon(doc.fileType)}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate leading-snug">{doc.title}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{doc.fileSizeKb} KB • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-gray-100 transition-colors" title="Xem tài liệu">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {isStaff && (
                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" title="Xóa tài liệu">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions/Units Timeline */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Chương trình học theo từng Unit
            </h3>
            {loadingSessions ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">Chưa có nội dung buổi học nào</p>
                <p className="text-xs text-gray-400 mt-0.5">Vui lòng quay lại sau hoặc liên hệ giáo viên</p>
              </div>
            ) : (
              <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-8">
                {sessions.map((s) => (
                  <div key={s.id} className="relative group/timeline animate-in fade-in duration-300">
                    {/* Circle marker */}
                    <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-white group-hover/timeline:bg-amber-600 transition-colors">
                      {s.sessionNumber}
                    </div>

                    {/* Session content card */}
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap mb-3 border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm leading-snug group-hover/timeline:text-amber-600 transition-colors">
                            Unit {s.sessionNumber}: {s.topic || 'Chưa cập nhật chủ đề'}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-gray-500">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {new Date(s.sessionDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-500">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              {s.startTime} - {s.endTime}
                            </span>
                            {s.guestTeacherName && (
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                GV thay thế: {s.guestTeacherName}
                              </span>
                            )}
                          </div>
                        </div>

                        {isStaff && (
                          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover/timeline:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditSession(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all" title="Sửa buổi học">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteSession(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all" title="Xóa buổi học">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lesson notes */}
                      {s.note && (
                        <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          {s.note}
                        </p>
                      )}

                      {/* Session Documents list */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tài liệu học tập ({s.documents.length})</p>
                          {isStaff && (
                            <button
                              onClick={() => { setSelectedSessionForDoc(s.id); setShowAddDoc(true); }}
                              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
                            >
                              <Plus className="h-3 w-3" />
                              Thêm tài liệu
                            </button>
                          )}
                        </div>
                        {s.documents.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic">Chưa có tài liệu đính kèm cho buổi học này.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {s.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50/50 border border-gray-200/50 rounded-xl hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 group/doc">
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 min-w-0 flex-1 hover:text-amber-600 transition-colors">
                                  {getFileIcon(doc.fileType)}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate leading-snug">{doc.title}</p>
                                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{doc.fileSizeKb} KB</p>
                                  </div>
                                </a>
                                <div className="flex items-center shrink-0 ml-1">
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-gray-100 transition-colors">
                                    <Download className="h-3 w-3" />
                                  </a>
                                  {isStaff && (
                                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/doc:opacity-100 transition-colors">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Assignments tab ── */}
      {tab === 'assignments' && (
        <div className="space-y-6">
          {/* Header Action */}
          {isStaff && (
            <div className="flex justify-end">
              <Button size="sm" onClick={handleOpenAddAssignment} className="gap-1.5 text-xs font-semibold rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Giao bài tập mới
              </Button>
            </div>
          )}

          {loadingAssignments ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <CheckSquare className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-500">Chưa có bài tập nào được giao</p>
              <p className="text-xs text-gray-400 mt-0.5">Nội dung bài tập của bạn sẽ xuất hiện tại đây khi giáo viên đăng bài</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a) => {
                const isOverdue = a.dueDate && new Date(a.dueDate) < new Date()
                let statusBadge = null
                
                if (isStudent) {
                  if (a.submission) {
                    if (a.submission.grade !== null) {
                      statusBadge = (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Đã chấm: {a.submission.grade}/10
                        </span>
                      )
                    } else {
                      statusBadge = (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          Đã nộp bài (Chờ chấm)
                        </span>
                      )
                    }
                  } else {
                    statusBadge = (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isOverdue ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {isOverdue ? 'Trễ hạn nộp' : 'Chưa nộp bài'}
                      </span>
                    )
                  }
                } else {
                  // Teacher / Admin
                  statusBadge = (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {a.submissionsCount} học sinh đã nộp
                    </span>
                  )
                }

                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedAssignment(a)
                      if (isStudent) {
                        setSubmitForm({
                          submissionText: a.submission?.submissionText ?? '',
                          fileUrl: a.submission?.fileUrl ?? '',
                          fileName: a.submission?.fileName ?? ''
                        })
                        if (a.assignmentType === 'Quiz' && a.submission?.answersJson) {
                          try {
                            const answers: StudentAnswer[] = JSON.parse(a.submission.answersJson)
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
                    }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-extrabold text-gray-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-2">
                          {a.title}
                        </h4>
                        <div className="shrink-0">{statusBadge}</div>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-3 mb-4 font-medium leading-relaxed">
                        {a.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 flex-wrap gap-2 text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        Hạn nộp:{' '}
                        {a.dueDate ? (
                          <span className={isOverdue && !a.submission ? 'text-red-500 font-bold' : 'text-gray-600 font-bold'}>
                            {new Date(a.dueDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-gray-500">Không có hạn chót</span>
                        )}
                      </span>

                      {isStaff && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => handleOpenEditAssignment(a, e)} className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Sửa bài tập">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => handleDeleteAssignment(a.id, e)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Xóa bài tập">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. Members tab ── */}
      {tab === 'members' && (
        <div>
          {/* Actions - Chỉ hiển thị cho Admin và Giáo viên */}
          {isStaff && (
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={() => setShowAdd(true)} className="gap-1.5 rounded-xl font-semibold text-xs h-9">
                <Plus className="h-4 w-4" />
                Thêm học viên
              </Button>

              {activeInvite ? (
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0 max-w-xl animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-0">
                    <Link2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="truncate text-gray-600 flex-1 text-xs font-mono">{activeInvite.inviteUrl}</span>
                    <button
                      onClick={() => handleCopy(activeInvite.inviteUrl)}
                      className="shrink-0 p-1 rounded-lg hover:bg-amber-100 transition-colors"
                      title="Sao chép link"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in duration-200" />
                      ) : (
                        <Copy className="h-4 w-4 text-amber-600" />
                      )}
                    </button>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setShowInvite(true)}
                    className="h-[38px] text-xs font-semibold px-3 rounded-xl"
                    title="Tạo lại link mới (thu hồi link cũ)"
                  >
                    Tạo mới link
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowRevokeConfirm(true)}
                    className="h-[38px] px-3 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold rounded-xl"
                    title="Hủy link mời"
                  >
                    Hủy link
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setShowInvite(true)} className="gap-1.5 rounded-xl font-semibold text-xs h-9">
                  <Link2 className="h-4 w-4" />
                  Tạo link mời
                </Button>
              )}
            </div>
          )}

          {/* Member table */}
          {cls.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-gray-600 font-bold text-sm">Chưa có học viên nào trong lớp</p>
              {isStaff && <p className="text-gray-400 text-xs mt-0.5">Thêm học viên hoặc chia sẻ link mời để thu hút đăng ký</p>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
                <table className="w-full text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Học viên</th>
                      <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Ngày tham gia</th>
                      <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-400 hidden md:table-cell">Trạng thái</th>
                      {isStaff && <th className="w-12 px-4 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((m) => (
                      <tr key={m.memberId} className="border-t border-gray-100 hover:bg-amber-50/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/40">
                              <span className="text-xs font-bold text-amber-700">
                                {m.fullName[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate leading-snug">{m.fullName}</p>
                              <p className="text-xs text-gray-400 font-semibold truncate mt-0.5">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-semibold text-xs hidden sm:table-cell">
                          {new Date(m.joinedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Đang học
                          </span>
                        </td>
                        {isStaff && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xóa học viên ${m.fullName} khỏi lớp?`)) {
                                  removeMember(m.memberId)
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalMemberPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500">
                    Hiển thị học viên từ <span className="font-bold text-gray-900">{((activeMemberPage - 1) * MEMBER_PAGE_SIZE) + 1}</span> đến{' '}
                    <span className="font-bold text-gray-900">
                      {Math.min(activeMemberPage * MEMBER_PAGE_SIZE, totalMembers)}
                    </span>{' '}
                    trong tổng số <span className="font-bold text-gray-900">{totalMembers}</span> học viên
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMemberPage(p => Math.max(p - 1, 1))}
                      disabled={activeMemberPage === 1}
                      className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalMemberPages }).map((_, idx) => {
                      const pNum = idx + 1
                      if (totalMemberPages > 5 && Math.abs(pNum - activeMemberPage) > 1 && pNum !== 1 && pNum !== totalMemberPages) {
                        if (pNum === 2 || pNum === totalMemberPages - 1) {
                          return <span key={pNum} className="text-xs text-gray-400 px-1 font-bold">...</span>
                        }
                        return null
                      }

                      return (
                        <Button
                          key={pNum}
                          variant={activeMemberPage === pNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMemberPage(pNum)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all ${
                            activeMemberPage === pNum
                              ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 hover:text-white'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMemberPage(p => Math.min(p + 1, totalMemberPages))}
                      disabled={activeMemberPage === totalMemberPages}
                      className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── 4. Info tab ── */}
      {tab === 'info' && (
        <div>
          {editForm ? (
            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg bg-white border border-gray-200 p-6 rounded-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tên lớp</label>
                <Input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, name: e.target.value } : p)}
                />
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giáo viên phụ trách</label>
                  <TeacherSelect
                    value={editForm.teacherId ?? ''}
                    onChange={(val) => setEditForm((p) => p ? { ...p, teacherId: val } : p)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</label>
                <CustomDropdown
                  value={editForm.status ?? 'active'}
                  options={STATUS_OPTIONS.map((s) => ({ id: s, name: STATUS_LABEL[s] }))}
                  onChange={(val) => setEditForm((p) => p ? { ...p, status: val } : p)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lịch học</label>
                <div className="flex gap-1.5 flex-wrap">
                  {WEEKDAYS.map((day) => {
                    const currentDays = editForm.scheduleDays ? editForm.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean) : []
                    const isSelected = currentDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected
                            ? currentDays.filter((d) => d !== day)
                            : [...currentDays, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
                          setEditForm((p) => p ? { ...p, scheduleDays: newDays.join(',') } : p)
                        }}
                        className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/20'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giờ học</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="time"
                      value={(editForm.scheduleTime || '').split('-')[0]?.trim() || ''}
                      onChange={(e) => {
                        const newStart = e.target.value
                        setEditForm((p) => {
                          if (!p) return null
                          const [, currentEnd = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                          return {
                            ...p,
                            scheduleTime: newStart || currentEnd ? `${newStart}-${currentEnd}` : '',
                          }
                        })
                      }}
                      className="w-full text-center rounded-xl"
                    />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">đến</span>
                  <div className="relative flex-1">
                    <Input
                      type="time"
                      value={(editForm.scheduleTime || '').split('-')[1]?.trim() || ''}
                      onChange={(e) => {
                        const newEnd = e.target.value
                        setEditForm((p) => {
                          if (!p) return null
                          const [currentStart = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                          return {
                            ...p,
                            scheduleTime: currentStart || newEnd ? `${currentStart}-${newEnd}` : '',
                          }
                        })
                      }}
                      className="w-full text-center rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú</label>
                <Input value={editForm.note ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, note: e.target.value } : p)}
                />
              </div>

              {editError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700 font-semibold">{editError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" onClick={() => setEditForm(null)} className="rounded-xl">Huỷ</Button>
                <Button type="submit" disabled={updating} className="rounded-xl">
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card 1: Học thuật & Phụ trách */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <h4 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-amber-500" />
                    Học thuật & Quản lý
                  </h4>
                  
                  <div className="space-y-3.5">
                    {/* Danh mục */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Chương trình học</span>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: cls.categoryColorHex }}
                      >
                        {cls.categoryName}
                      </span>
                    </div>

                    {/* Giáo viên */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Giáo viên phụ trách</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                          <span className="text-[10px] font-bold text-amber-700">
                            {cls.teacherName[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">{cls.teacherName}</span>
                      </div>
                    </div>

                    {/* Ngày khai giảng */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Ngày bắt đầu</span>
                      <span className="font-bold text-gray-900">
                        {new Date(cls.startDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Trạng thái lớp */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Trạng thái</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
                        {STATUS_LABEL[cls.status] ?? cls.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Lịch học & Thời khóa biểu */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <h4 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-amber-500" />
                    Lịch học & Thời gian
                  </h4>
                  
                  <div className="space-y-3.5">
                    {/* Ngày học */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Lịch học trong tuần</span>
                      <div className="flex gap-1.5 flex-wrap mt-0.5">
                        {WEEKDAYS.map((day) => {
                          const isSelected = cls.scheduleDays?.split(',').map(d => d.trim()).includes(day)
                          return (
                            <span
                              key={day}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold border flex items-center justify-center select-none transition-all ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}
                            >
                              {day}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {/* Giờ học */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Khung giờ học</span>
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs">
                        {cls.scheduleTime || 'Chưa thiết lập'}
                      </span>
                    </div>

                    {/* Sĩ số */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Sĩ số lớp học</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        {cls.members.length} / {cls.maxStudents ?? '∞'} học viên
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Ghi chú lớp học */}
              {cls.note && (
                <div className="bg-amber-50/30 border border-amber-200/40 rounded-2xl p-5 flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 shadow-sm border border-amber-200/50 mt-0.5">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">Ghi chú lớp học</h5>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{cls.note}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons - Chỉ hiển thị cho Giáo viên và Admin */}
              {isStaff && (
                <div className="pt-2 flex justify-start gap-3">
                  <Button onClick={startEdit} variant="secondary" className="font-semibold gap-1.5 rounded-xl text-xs px-4 h-9">
                    <Edit2 className="h-3.5 w-3.5" />
                    Chỉnh sửa thông tin
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      className="font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 rounded-xl text-xs px-4 h-9"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa lớp học
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Add member modal ── */}
      {showAddMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdd(false)
              setSearchQ('')
              setAddError('')
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[480px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Thêm học viên vào lớp</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tìm học viên đã đăng ký tài khoản tại hệ thống</p>
              </div>
              <button
                onClick={() => {
                  setShowAdd(false)
                  setSearchQ('')
                  setAddError('')
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  autoFocus
                  placeholder="Nhập tên hoặc email học viên..."
                  value={searchQ}
                  onChange={(e) => {
                    setSearchQ(e.target.value)
                    setAddError('')
                  }}
                  className="pl-10 pr-8 py-2.5 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-sm"
                />
                {searchQ && (
                  <button
                    onClick={() => setSearchQ('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Error banner */}
              {addError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {addError}
                  </p>
                </div>
              )}

              {/* Empty search state */}
              {searchQ.trim().length < 2 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Hãy nhập từ khóa tìm kiếm</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[240px] font-medium">
                    Nhập tối thiểu 2 ký tự (tên hoặc email) để hệ thống bắt đầu tìm kiếm học viên
                  </p>
                </div>
              )}

              {/* Search Results list */}
              {searchQ.trim().length >= 2 && (
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kết quả tìm kiếm ({searchResults.length})</p>
                  
                  {searchResults.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-100 rounded-xl bg-gray-50/50 py-4">
                      <p className="text-sm font-semibold text-gray-500">Không tìm thấy học viên</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-[220px] font-medium">
                        Hãy chắc chắn rằng học viên đã tạo tài khoản với email này
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white overflow-y-auto min-h-0">
                      {searchResults.map((s) => {
                        const isAlreadyMember = cls?.members.some(m => m.studentId === s.studentId)
                        
                        return (
                          <div
                            key={s.studentId}
                            className="flex items-center justify-between p-3.5 hover:bg-amber-50/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
                                <span className="text-xs font-bold text-amber-700">
                                  {s.fullName[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate leading-snug">{s.fullName}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{s.email}</p>
                              </div>
                            </div>

                            {isAlreadyMember ? (
                              <span className="text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg select-none">
                                Đã tham gia
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAddMember(s.studentId)}
                                disabled={adding}
                                className="h-8 rounded-lg text-xs px-3 gap-1 hover:bg-amber-500 hover:text-white transition-all font-semibold"
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
          </div>
        </div>
      )}

      {/* ── Invite modal ── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-1">Tạo link mời</h2>
            <p className="text-sm text-gray-500 mb-5 font-semibold">Học viên dùng link này để tham gia lớp</p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thời hạn (ngày)</label>
              <Input
                type="number" min="0"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400">Nhập 0 để link không bao giờ hết hạn</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowInvite(false)}>Huỷ</Button>
              <Button className="flex-1 rounded-xl" onClick={handleInvite} disabled={creatingInvite}>
                {creatingInvite ? <><Loader2 className="h-4 w-4 animate-spin" />Đang tạo...</> : 'Tạo link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Revoke confirm modal ── */}
      {showRevokeConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200"
          onClick={() => setShowRevokeConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4 mx-auto">
              <AlertTriangle className="h-6 w-6 shrink-0" />
            </div>
            
            <h3 className="text-center font-bold text-lg text-gray-900 mb-2">Hủy link mời học viên?</h3>
            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
              Bạn có chắc chắn muốn hủy link mời này? Học sinh sẽ không thể tham gia lớp học qua link này được nữa.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-semibold"
                onClick={() => setShowRevokeConfirm(false)}
              >
                Quay lại
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl text-xs font-semibold border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold shadow-sm"
                onClick={() => {
                  revokeInvite(undefined, {
                    onSuccess: () => setShowRevokeConfirm(false)
                  })
                }}
                disabled={revokingInvite}
              >
                {revokingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Session Modal ── */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200" onClick={() => setShowAddSession(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg text-gray-900 mb-4">{editingSession ? 'Cập nhật buổi học' : 'Thêm buổi học mới (Unit)'}</h2>
            <form onSubmit={handleSaveSession} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Số buổi (Unit #)</label>
                  <Input type="number" min="1" value={sessionForm.sessionNumber} onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: Number(e.target.value) })} required className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày học</label>
                  <Input type="date" value={sessionForm.sessionDate} onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })} required className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giờ bắt đầu</label>
                  <Input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })} required className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giờ kết thúc</label>
                  <Input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })} required className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chủ đề (Topic)</label>
                <Input value={sessionForm.topic} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} placeholder="ví dụ: Unit 1: Pronunciation" required className="rounded-xl" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú / Nội dung chính</label>
                <textarea value={sessionForm.note} onChange={(e) => setSessionForm({ ...sessionForm, note: e.target.value })} placeholder="Mô tả nội dung buổi học..." className="w-full min-h-[80px] p-3 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowAddSession(false)}>Huỷ</Button>
                <Button type="submit" disabled={createSessionMutation.isPending || updateSessionMutation.isPending} className="flex-1 rounded-xl">Lưu</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Document Modal ── */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200" onClick={() => setShowAddDoc(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg text-gray-900 mb-2">Thêm tài liệu học tập</h2>
            <p className="text-xs text-gray-400 mb-4">
              {selectedSessionForDoc 
                ? `Tài liệu này sẽ được đính kèm vào Unit của buổi học.` 
                : 'Tài liệu này sẽ xuất hiện trong phần Giáo trình & Tài liệu chung của lớp.'}
            </p>
            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề tài liệu</label>
                <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Ví dụ: Giáo trình Giao tiếp.pdf" required className="rounded-xl" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đường dẫn tệp (URL / Link ngoài)</label>
                <Input value={docForm.fileUrl} onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })} placeholder="https://..." required className="rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Định dạng file</label>
                  <CustomDropdown
                    value={docForm.fileType}
                    options={[
                      { id: 'pdf', name: 'PDF Document (.pdf)' },
                      { id: 'word', name: 'Microsoft Word (.docx)' },
                      { id: 'ppt', name: 'Powerpoint (.pptx)' },
                      { id: 'other', name: 'Other Link' }
                    ]}
                    onChange={(val) => setDocForm({ ...docForm, fileType: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kích thước file (KB)</label>
                  <Input type="number" min="1" value={docForm.fileSizeKb} onChange={(e) => setDocForm({ ...docForm, fileSizeKb: Number(e.target.value) })} required className="rounded-xl" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowAddDoc(false)}>Huỷ</Button>
                <Button type="submit" disabled={createDocMutation.isPending} className="flex-1 rounded-xl">Thêm tài liệu</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Assignment Modal ── */}
      {showAddAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200" onClick={() => setShowAddAssignment(false)}>
          <div
            className={`bg-white rounded-2xl shadow-xl w-full p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] transition-all duration-300 ${
              assignmentForm.assignmentType === 'Quiz' ? 'max-w-2xl' : 'max-w-md'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg text-gray-900 mb-4">{editingAssignment ? 'Cập nhật bài tập' : 'Giao bài tập mới'}</h2>
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề bài tập</label>
                <Input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="Ví dụ: Luyện nghe Unit 1" required className="rounded-xl" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Yêu cầu & Đề bài chi tiết</label>
                <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} placeholder="Mô tả các yêu cầu, các bước thực hiện của học viên..." className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loại bài tập</label>
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hạn nộp (Deadline)</label>
                  <Input type="datetime-local" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={assignmentForm.allowLateSubmission}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, allowLateSubmission: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="allowLate" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                  Cho phép nộp trễ sau deadline
                </label>
              </div>

              {/* Questions Builder if Quiz */}
              {assignmentForm.assignmentType === 'Quiz' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-700">Danh sách câu hỏi ({assignmentQuestions.length})</h3>
                    <Button type="button" size="sm" onClick={addQuestion} className="text-xs font-semibold rounded-lg gap-1">
                      <Plus className="h-3 w-3" /> Thêm câu hỏi
                    </Button>
                  </div>

                  {assignmentQuestions.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                      Chưa có câu hỏi nào. Bấm nút trên để bắt đầu thêm câu hỏi.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {assignmentQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative group/question">
                          <button
                            type="button"
                            onClick={() => deleteQuestion(idx)}
                            className="absolute right-3 top-3 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Loại câu hỏi</label>
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
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Điểm số</label>
                              <Input
                                type="number" min="0.5" step="0.5"
                                value={q.points}
                                onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                                className="rounded-xl h-[38px] text-xs font-semibold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Câu hỏi / Đề bài</label>
                            <Input
                              value={q.questionText}
                              onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                              placeholder="Nhập nội dung câu hỏi..."
                              required
                              className="rounded-xl h-[38px] text-xs"
                            />
                          </div>

                          {/* Multiple Choice Options Builder */}
                          {q.type === 'MultipleChoice' && q.options && (
                            <div className="space-y-2 border-t border-gray-100 pt-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Các phương án trả lời</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                                  <div key={opt} className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-500">{opt}:</span>
                                    <Input
                                      value={q.options?.[optIdx] ?? ''}
                                      onChange={(e) => {
                                        const newOpts = [...(q.options || ['', '', '', ''])]
                                        newOpts[optIdx] = e.target.value
                                        updateQuestion(idx, { options: newOpts })
                                      }}
                                      placeholder={`Phương án ${opt}...`}
                                      required
                                      className="rounded-xl h-8 text-xs flex-1"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-1 mt-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Đáp án đúng</label>
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
                            <div className="space-y-1 border-t border-gray-100 pt-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Đáp án đúng</label>
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
                            <div className="space-y-1 border-t border-gray-100 pt-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Từ/cụm từ đúng (Đáp án đúng)</label>
                              <Input
                                value={q.correctAnswer ?? ''}
                                onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                                placeholder="Nhập đáp án đúng..."
                                required
                                className="rounded-xl h-[38px] text-xs"
                              />
                            </div>
                          )}

                          {/* Short Answer Option */}
                          {q.type === 'ShortAnswer' && (
                            <div className="space-y-1 border-t border-gray-100 pt-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Đáp án đúng tham chiếu (Không bắt buộc)</label>
                              <Input
                                value={q.correctAnswer ?? ''}
                                onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                                placeholder="Nếu có đáp án mẫu, nhập vào đây..."
                                className="rounded-xl h-[38px] text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowAddAssignment(false)}>Huỷ</Button>
                <Button type="submit" disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending} className="flex-1 rounded-xl">Lưu bài tập</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assignment Details & Submissions Modal (for Student/Staff) ── */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedAssignment(null)}>
          <div className="bg-white w-full max-w-2xl h-full flex flex-col animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Bài tập về nhà
                </span>
                <h2 className="font-extrabold text-lg text-gray-900 mt-1.5 leading-snug pr-4">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Deadline & Instructions */}
              <div className="bg-gray-50 border border-gray-200/60 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Hạn nộp:{' '}
                  {selectedAssignment.dueDate ? (
                    <span className="text-gray-900 font-extrabold">
                      {new Date(selectedAssignment.dueDate).toLocaleString('vi-VN')}
                    </span>
                  ) : (
                    <span className="text-gray-500">Không giới hạn</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap">
                  {selectedAssignment.description}
                </div>
              </div>

              {/* Student Workflow: Submit homework */}
              {isStudent && (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-amber-500" />
                    Bài làm của bạn
                  </h3>

                  {/* Warning if overdue and late submission is blocked */}
                  {(() => {
                    const isOverdue = selectedAssignment.dueDate && new Date(selectedAssignment.dueDate) < new Date()
                    const isBlocked = isOverdue && !selectedAssignment.allowLateSubmission
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
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                          <p className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
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
                    <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex gap-4 items-start mb-4 animate-in fade-in duration-200">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 border-4 border-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-lg font-black text-emerald-800 leading-none">{selectedAssignment.submission.grade}</span>
                        <span className="text-[8px] font-bold text-emerald-500 tracking-wider">ĐIỂM</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Kết quả & Đánh giá từ Giáo viên</h4>
                        <p className="text-sm text-emerald-700 font-semibold mt-1 leading-relaxed whitespace-pre-wrap">
                          {selectedAssignment.submission.teacherFeedback || 'Tuyệt vời! Hãy tiếp tục phát huy nhé.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submission View / Form */}
                  {selectedAssignment.assignmentType === 'Quiz' ? (
                    // Quiz questions view
                    <form onSubmit={handleSubmitWork} className="space-y-4 bg-gray-50/50 p-5 border border-gray-100 rounded-2xl">
                      {(() => {
                        const questions: AssignmentQuestion[] = selectedAssignment.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
                        const hasSubmitted = !!selectedAssignment.submission
                        const isOverdue = selectedAssignment.dueDate && new Date(selectedAssignment.dueDate) < new Date()
                        const isBlocked = isOverdue && !selectedAssignment.allowLateSubmission && !hasSubmitted
                        const isGraded = selectedAssignment.submission?.grade !== null && selectedAssignment.submission?.grade !== undefined

                        const submissionAnswers: StudentAnswer[] = selectedAssignment.submission?.answersJson 
                          ? JSON.parse(selectedAssignment.submission.answersJson) 
                          : []

                        return (
                          <div className="space-y-6">
                            {questions.map((q, idx) => {
                              const studentAns = quizAnswers[q.id] ?? ''
                              const savedAnsObj = submissionAnswers.find(sa => sa.questionId === q.id)
                              const isCorrect = savedAnsObj?.isCorrect
                              const questionGrade = savedAnsObj?.grade

                              return (
                                <div key={q.id} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 shadow-sm">
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className="text-xs font-bold text-gray-800">
                                      Câu {idx + 1} ({q.points} điểm): {q.questionText}
                                    </h4>
                                    {hasSubmitted && (
                                      <div className="shrink-0 text-[10px] font-bold">
                                        {isCorrect === true && (
                                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            Đúng (+{q.points}đ)
                                          </span>
                                        )}
                                        {isCorrect === false && (
                                          <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                            Sai (0đ)
                                          </span>
                                        )}
                                        {isCorrect === undefined && (
                                          <span className="text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                            {isGraded ? `Chấm điểm: ${questionGrade ?? 0}/${q.points}đ` : 'Chờ chấm'}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Rendering Question Body */}
                                  {q.type === 'MultipleChoice' && q.options && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {['A', 'B', 'C', 'D'].map((choice, oIdx) => {
                                        const optionText = q.options?.[oIdx] || ''
                                        const isSelected = studentAns === choice
                                        const optionId = `q-${q.id}-${choice}`
                                        return (
                                          <label
                                            key={choice}
                                            htmlFor={optionId}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                              isSelected
                                                ? 'bg-amber-50 border-amber-500 text-amber-700'
                                                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                                            }`}
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
                                            <span className="font-bold">{choice}.</span>
                                            <span>{optionText}</span>
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
                                        return (
                                          <label
                                            key={choice}
                                            htmlFor={optionId}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                              isSelected
                                                ? choice === 'True' 
                                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                  : 'bg-red-50 border-red-500 text-red-700'
                                                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                                            }`}
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
                                    <Input
                                      value={studentAns}
                                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                      disabled={hasSubmitted || isBlocked}
                                      placeholder="Nhập từ cần điền..."
                                      className="rounded-xl h-9 text-xs"
                                    />
                                  )}

                                  {q.type === 'ShortAnswer' && (
                                    <Input
                                      value={studentAns}
                                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                      disabled={hasSubmitted || isBlocked}
                                      placeholder="Nhập câu trả lời ngắn..."
                                      className="rounded-xl h-9 text-xs"
                                    />
                                  )}

                                  {q.type === 'Writing' && (
                                    <textarea
                                      value={studentAns}
                                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                      disabled={hasSubmitted || isBlocked}
                                      placeholder="Viết bài làm của bạn tại đây..."
                                      className="w-full min-h-[80px] p-3 text-xs rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                                    />
                                  )}

                                  {/* Individual feedback if graded */}
                                  {savedAnsObj?.teacherFeedback && (
                                    <div className="bg-amber-50/30 border border-amber-200/20 p-2.5 rounded-lg text-[11px] text-gray-500 font-semibold italic">
                                      Giáo viên nhận xét: {savedAnsObj.teacherFeedback}
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                            {hasSubmitted && (
                              <p className="text-[10px] text-gray-400 font-bold">
                                Đã nộp lúc: {new Date(selectedAssignment.submission!.submittedAt).toLocaleString('vi-VN')}
                              </p>
                            )}

                            {(!hasSubmitted || selectedAssignment.submission?.grade === null) && !isBlocked && (
                              <Button type="submit" disabled={submitAssignmentMutation.isPending} className="w-full gap-1.5 rounded-xl font-bold py-2.5 shadow-sm shadow-amber-500/10">
                                {submitAssignmentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {hasSubmitted ? 'Cập nhật bài nộp Quiz' : 'Nộp bài làm Quiz'}
                              </Button>
                            )}
                          </div>
                        )
                      })()}
                    </form>
                  ) : (
                    // Upload / text submission form
                    <form onSubmit={handleSubmitWork} className="space-y-4 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
                      {(() => {
                        const hasSubmitted = !!selectedAssignment.submission
                        const isOverdue = selectedAssignment.dueDate && new Date(selectedAssignment.dueDate) < new Date()
                        const isBlocked = isOverdue && !selectedAssignment.allowLateSubmission && !hasSubmitted
                        if (isBlocked) return null;

                        return (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung bài làm / Link Google Drive</label>
                              <textarea
                                value={submitForm.submissionText}
                                onChange={(e) => setSubmitForm({ ...submitForm, submissionText: e.target.value })}
                                placeholder="Nhập nội dung trả lời hoặc dán link Google Drive/Dropbox chứa bài làm của bạn..."
                                className="w-full min-h-[100px] p-3 text-sm bg-white rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
                                required
                                disabled={selectedAssignment.submission?.grade !== null && selectedAssignment.submission?.grade !== undefined}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tải tệp từ thiết bị (Ảnh/PDF/Word)</label>
                                <div className="flex items-center gap-2">
                                  <label
                                    className={`flex items-center gap-1.5 px-3 h-[38px] rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer select-none transition-all ${
                                      uploadingFile || selectedAssignment.submission?.grade !== null
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                      disabled={uploadingFile || (selectedAssignment.submission?.grade !== null && selectedAssignment.submission?.grade !== undefined)}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setUploadingFile(true)
                                        try {
                                          const res = await classesApi.uploadFile(file)
                                          setSubmitForm((prev) => ({
                                            ...prev,
                                            fileUrl: res.fileUrl,
                                            fileName: res.fileName
                                          }))
                                          alert('Tải tệp lên thành công!')
                                        } catch {
                                          alert('Tải tệp thất bại, vui lòng thử lại!')
                                        } finally {
                                          setUploadingFile(false)
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    {uploadingFile ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                                    ) : (
                                      <Upload className="h-4 w-4 text-gray-500" />
                                    )}
                                    Chọn tệp đính kèm
                                  </label>
                                  {submitForm.fileName && (
                                    <span className="text-[10px] text-gray-500 font-bold truncate max-w-[150px]">
                                      {submitForm.fileName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đường dẫn tệp đính kèm (URL)</label>
                                <Input
                                  value={submitForm.fileUrl}
                                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                                  placeholder="https://..."
                                  className="rounded-xl bg-white"
                                  disabled={selectedAssignment.submission?.grade !== null && selectedAssignment.submission?.grade !== undefined}
                                />
                              </div>
                            </div>

                            {selectedAssignment.submission?.submittedAt && (
                              <p className="text-[10px] text-gray-400 font-bold">
                                Đã nộp lúc: {new Date(selectedAssignment.submission.submittedAt).toLocaleString('vi-VN')}
                              </p>
                            )}

                            {(!selectedAssignment.submission || selectedAssignment.submission.grade === null) && (
                              <Button type="submit" disabled={submitAssignmentMutation.isPending || uploadingFile} className="w-full gap-1.5 rounded-xl font-bold py-2.5 shadow-sm shadow-amber-500/10">
                                {submitAssignmentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                                {selectedAssignment.submission ? 'Cập nhật bài nộp' : 'Nộp bài làm'}
                              </Button>
                            )}
                          </>
                        )
                      })()}
                    </form>
                  )}
                </div>
              )}

              {/* Teacher/Admin Workflow: Manage submissions */}
              {isStaff && (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-amber-500" />
                    Danh sách học viên nộp bài ({submissions.length})
                  </h3>

                  {loadingSubmissions ? (
                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /></div>
                  ) : submissions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Chưa có học sinh nào nộp bài tập này.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="bg-gray-50 border border-gray-200/70 p-4 rounded-2xl flex flex-col justify-between hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap sm:flex-nowrap border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                                <span className="text-[10px] font-bold text-amber-700">{sub.studentName[0]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">{sub.studentName}</p>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{sub.studentEmail}</p>
                              </div>
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400">
                                Nộp: {new Date(sub.submittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {sub.grade !== null ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {sub.grade} Điểm
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  Chờ chấm
                                </span>
                              )}
                            </div>
                          </div>

                          {selectedAssignment.assignmentType === 'Quiz' && sub.answersJson ? (
                            <div className="space-y-2 mb-3 bg-white border border-gray-100 p-3 rounded-xl">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chi tiết bài làm Quiz</p>
                              {(() => {
                                const questions: AssignmentQuestion[] = selectedAssignment.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
                                const answers: StudentAnswer[] = JSON.parse(sub.answersJson)
                                return (
                                  <div className="space-y-2 divide-y divide-gray-50">
                                    {questions.map((q, qIdx) => {
                                      const ansObj = answers.find((ans) => ans.questionId === q.id)
                                      return (
                                        <div key={q.id} className="pt-2 text-xs">
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="font-semibold text-gray-700">Câu {qIdx + 1}: {q.questionText}</span>
                                            {ansObj?.isCorrect === true && <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">Đúng (+{q.points}đ)</span>}
                                            {ansObj?.isCorrect === false && <span className="text-red-600 font-bold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shrink-0">Sai (0đ)</span>}
                                            {ansObj?.isCorrect === undefined && (
                                              <span className="text-gray-500 font-bold text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                                                Tự luận: {ansObj?.grade !== undefined && ansObj?.grade !== null ? `${ansObj.grade}/${q.points}đ` : 'Chờ chấm'}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-gray-500 mt-1 font-semibold pl-2 border-l-2 border-gray-200">
                                            Trả lời: <span className="text-gray-800 font-bold">{ansObj?.answerText || '(Trống)'}</span>
                                          </p>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })()}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-700 font-semibold whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 p-3 rounded-xl mb-3">
                              {sub.submissionText}
                            </div>
                          )}

                          {sub.fileUrl && (
                            <div className="mb-3">
                              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold bg-amber-50/50 border border-amber-100 px-3 py-1 rounded-lg">
                                <Paperclip className="h-3.5 w-3.5" />
                                {sub.fileName || 'Xem file đính kèm'}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          {sub.teacherFeedback && (
                            <div className="bg-amber-50/20 border border-amber-200/20 p-2.5 rounded-xl text-xs text-gray-500 mb-3 font-semibold italic">
                              GV phản hồi: {sub.teacherFeedback}
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleOpenGrade(sub)} className="text-[11px] font-bold h-8 rounded-lg">
                              Chấm điểm & Nhận xét
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Teacher Grading Modal ── */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200" onClick={() => setShowGradeModal(false)}>
          <div
            className={`bg-white rounded-2xl shadow-xl w-full p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] transition-all duration-300 ${
              selectedAssignment?.assignmentType === 'Quiz' ? 'max-w-2xl' : 'max-w-sm'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-gray-900 mb-1">Chấm điểm bài làm</h3>
            <p className="text-xs text-gray-400 mb-4 font-semibold">Học sinh: {selectedSubmission.studentName}</p>
            <form onSubmit={handleGradeSub} className="space-y-4">
              {selectedAssignment?.assignmentType === 'Quiz' ? (
                // Detailed Quiz Grading View
                <div className="space-y-4">
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl mb-4">
                    <p className="text-xs text-amber-800 font-bold">
                      Tổng điểm đã chấm: <span className="text-sm font-extrabold">{gradeForm.grade}</span> /{' '}
                      {(() => {
                        const questions: AssignmentQuestion[] = selectedAssignment.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
                        return questions.reduce((sum, q) => sum + q.points, 0)
                      })()}{' '}
                      điểm
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {(() => {
                      const questions: AssignmentQuestion[] = selectedAssignment.questionsJson ? JSON.parse(selectedAssignment.questionsJson) : []
                      const answers: StudentAnswer[] = gradeForm.answersJson ? JSON.parse(gradeForm.answersJson) : []

                      return questions.map((q, idx) => {
                        const studentAnsObj = answers.find((ans) => ans.questionId === q.id)
                        const isAutoGraded = q.type === 'MultipleChoice' || q.type === 'TrueFalse' || q.type === 'FillInTheBlank'

                        return (
                          <div key={q.id} className="p-3 border border-gray-200 rounded-xl space-y-2.5 bg-gray-50/30">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-gray-800">
                                Câu {idx + 1} ({q.points}đ): {q.questionText}
                              </span>
                              {isAutoGraded ? (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  studentAnsObj?.isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0' : 'bg-red-50 text-red-700 border border-red-200 shrink-0'
                                }`}>
                                  {studentAnsObj?.isCorrect ? `Đúng (+${q.points}đ)` : 'Sai (0đ)'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                                  GV chấm điểm
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-semibold pl-2 border-l-2 border-gray-200">
                              Học sinh trả lời:{' '}
                              <span className="text-gray-800 font-bold">{studentAnsObj?.answerText || '(Trống)'}</span>
                            </div>

                            {/* Manual grade inputs for ShortAnswer and Writing */}
                            {!isAutoGraded && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Điểm câu này (Tối đa {q.points})</label>
                                  <Input
                                    type="number" min="0" max={q.points} step="0.5"
                                    value={studentAnsObj?.grade ?? 0}
                                    onChange={(e) => handleWritingGradeChange(q.id, Number(e.target.value))}
                                    className="rounded-xl h-8 text-xs font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nhận xét riêng câu này</label>
                                  <Input
                                    value={studentAnsObj?.teacherFeedback ?? ''}
                                    onChange={(e) => handleWritingFeedbackChange(q.id, e.target.value)}
                                    placeholder="Nhận xét..."
                                    className="rounded-xl h-8 text-xs"
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm số (thang điểm 10)</label>
                  <Input
                    type="number" step="0.1" min="0" max="10"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })}
                    required
                    className="rounded-xl font-extrabold text-base"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú nhận xét chung</label>
                <textarea
                  value={gradeForm.teacherFeedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, teacherFeedback: e.target.value })}
                  placeholder="Nhận xét chung về bài làm của học sinh..."
                  className="w-full min-h-[80px] p-3 text-xs rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setShowGradeModal(false)}>Huỷ</Button>
                <Button type="submit" disabled={gradeSubmissionMutation.isPending} className="flex-1 rounded-xl text-xs font-semibold">Lưu điểm</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

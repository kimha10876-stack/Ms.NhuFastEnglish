import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Info, Trash2, Plus, Copy, Link2, CreditCard,
  Loader2, Check, AlertTriangle, Search, Edit2,
  ChevronLeft, ChevronRight, ChevronDown, BookOpen, FileText, Calendar,
  Clock, Sparkles, MapPin, Save, CheckCircle2, AlertCircle,
  Paperclip, ExternalLink, Send, Download, PlusCircle,
  GraduationCap, File, CheckSquare, XCircle, Megaphone, Bold, Italic, Underline, MoreVertical
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  useClasses, useClassDetail, useUpdateClass, useDeleteClass, useClassCategories,
  useAddMember, useRemoveMember, useCreateInvite, useSearchStudents,
  useActiveInvite, useRevokeInvite,
  useClassSessions, useCreateSession, useUpdateSession, useDeleteSession,
  useCreateDocument, useDeleteDocument,
  useClassAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment,
  useAssignmentSubmissions, useGradeSubmission,
  useCurriculumTemplates, useImportCurriculum,
  useClassAttendance, useUpdateAttendance, useUpdateMemberTuition,
  useClassAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
  useCreateComment, useDeleteComment, useSubmitAssignment,
  useClassTuitions, useConfirmTuitionPayment,
} from './useClasses'
import type { UpdateClassRequest, ClassSession, ClassAssignment, AssignmentSubmission, AssignmentQuestion, StudentAnswer } from './classes.types'
import TeacherSelect from './TeacherSelect'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { classesApi } from './classes.api'
import { useTeachers } from '@/features/teachers/useTeachers'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

type Tab = 'announcements' | 'lessons' | 'assignments' | 'members' | 'info' | 'tuition'

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

function formatContent(text: string) {
  if (!text) return ''
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>')
  escaped = escaped.replace(/__(.*?)__/g, '<u>$1</u>')
  escaped = escaped.replace(/\n/g, '<br />')

  const urlRegex = /(https?:\/\/[^\s]+)/g
  escaped = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-amber-600 hover:underline break-all font-semibold">$1</a>')

  return escaped
}

interface SessionAttendanceProps {
  classId: string
  sessionId: string
}

function SessionAttendance({ classId, sessionId }: SessionAttendanceProps) {
  const { data: attendanceList = [], isLoading: loadingAttendance } = useClassAttendance(classId, sessionId)
  const updateAttendanceMutation = useUpdateAttendance(classId, sessionId)
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)

  const handleToggle = (studentId: string, currentStatus: string | null, targetStatus: string) => {
    if (currentStatus === targetStatus) return
    setSavingStudentId(studentId)
    updateAttendanceMutation.mutate({ studentId, status: targetStatus }, {
      onSuccess: () => setSavingStudentId(null),
      onError: () => {
        setSavingStudentId(null)
        alert('Cập nhật điểm danh thất bại!')
      }
    })
  }

  if (loadingAttendance) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
      </div>
    )
  }

  const presentCount = attendanceList.filter(a => a.status === 'present' || a.status === null).length
  const absentCount = attendanceList.filter(a => a.status === 'absent').length

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 text-left">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            Điểm danh học viên
          </h5>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Tích chọn trạng thái đi học của học viên</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-150 animate-in fade-in duration-300">
          <span className="text-emerald-600">Đi học: {presentCount}</span>
          <span>•</span>
          <span className="text-red-500">Vắng: {absentCount}</span>
        </div>
      </div>
      
      {attendanceList.length === 0 ? (
        <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-medium italic">Không có học viên nào trong danh sách lớp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {attendanceList.map((att) => {
            const isPresent = att.status === 'present' || att.status === null;
            const isAbsent = att.status === 'absent';
            const isSaving = savingStudentId === att.studentId;

            return (
              <div key={att.studentId} className="flex items-center justify-between p-2.5 border border-gray-150 rounded-xl bg-gray-50/20 hover:bg-gray-50/60 transition-all">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-extrabold text-gray-900 truncate leading-snug">{att.fullName}</p>
                  <p className="text-[9px] text-gray-450 font-medium truncate">{att.email}</p>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {isSaving ? (
                    <div className="px-5 py-1">
                      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggle(att.studentId, att.status, 'present')}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all border ${
                          isPresent
                            ? 'bg-emerald-500 border-emerald-500 text-white font-extrabold shadow-xs'
                            : 'bg-white border-gray-200 text-gray-450 hover:bg-gray-50'
                        }`}
                      >
                        Đi học
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(att.studentId, att.status, 'absent')}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all border ${
                          isAbsent
                            ? 'bg-red-500 border-red-500 text-white font-extrabold shadow-xs'
                            : 'bg-white border-gray-200 text-gray-450 hover:bg-gray-50'
                        }`}
                      >
                        Vắng
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
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
  const [tab, setTab]               = useState<Tab>('announcements')
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
    note: '',
    guestTeacherId: ''
  })
  
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [selectedSessionForDoc, setSelectedSessionForDoc] = useState<string | null>(null) // null = tài liệu chung
  const [docForm, setDocForm] = useState({
    title: '',
    fileUrl: '',
    fileType: 'pdf',
    fileSizeKb: 100
  })
  useEffect(() => {
    if (docForm.fileUrl.includes('drive.google.com')) {
      setDocForm(prev => ({ ...prev, fileType: 'drive' }))
    } else if (docForm.fileUrl) {
      const ext = docForm.fileUrl.split('.').pop()?.toLowerCase() || ''
      if (ext === 'pdf') {
        setDocForm(prev => ({ ...prev, fileType: 'pdf' }))
      } else if (['doc', 'docx'].includes(ext)) {
        setDocForm(prev => ({ ...prev, fileType: 'word' }))
      } else if (['ppt', 'pptx'].includes(ext)) {
        setDocForm(prev => ({ ...prev, fileType: 'ppt' }))
      } else {
        setDocForm(prev => ({ ...prev, fileType: 'other' }))
      }
    }
  }, [docForm.fileUrl])

  const [shareClassIds, setShareClassIds] = useState<string[]>([])

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
  const [staffViewTab, setStaffViewTab] = useState<'submissions' | 'preview'>('submissions')
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})
  const [showImportModal, setShowImportModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

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
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Query Hooks
  const { data: cls, isLoading: loadingClass }       = useClassDetail(id)
  const { mutate: update, isPending: updating }      = useUpdateClass(id)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass()
  const { mutate: addMember, isPending: adding }     = useAddMember(id)
  const { mutate: removeMember }                     = useRemoveMember(id)
  const updateTuitionMutation = useUpdateMemberTuition(id)
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite()
  const { data: searchResults = [] }                 = useSearchStudents(searchQ)
  const { data: activeInvite }                       = useActiveInvite(id)
  const { mutate: revokeInvite, isPending: revokingInvite } = useRevokeInvite(id)

  // Sessions and Assignments Query Hooks
  const { data: sessionData, isLoading: loadingSessions } = useClassSessions(id)
  const { data: assignments = [], isLoading: loadingAssignments } = useClassAssignments(id)
  const { data: teachersData } = useTeachers({ pageSize: 100 })
  const teachersList = teachersData?.items ?? []
  const { data: classesData } = useClasses({ status: 'active', pageSize: 100 })
  const allActiveClasses = classesData?.items ?? []
  const otherActiveClasses = allActiveClasses.filter((c) => {
    if (c.id === id) return false
    if (isTeacher) return c.teacherName === user?.fullName
    return isAdmin
  })
  
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
  const { data: templates = [] } = useCurriculumTemplates()
  const { data: categories = [] } = useClassCategories()
  const importCurriculumMutation = useImportCurriculum(id)
  
  const { data: submissions = [], isLoading: loadingSubmissions } = useAssignmentSubmissions(selectedAssignment?.id ?? '')

  const sessions = sessionData?.sessions ?? []
  const generalDocuments = sessionData?.generalDocuments ?? []





  // Tuition hooks
  const { data: tuitionRecords = [], isLoading: loadingTuitions } = useClassTuitions(id)
  const confirmTuitionMutation = useConfirmTuitionPayment(id)
  const [showMonthlyFeeModal, setShowMonthlyFeeModal] = useState(false)
  const [newMonthlyFee, setNewMonthlyFee] = useState<number>(0)

  // Announcements and Comments states & hooks
  const { data: announcements = [], isLoading: loadingAnnouncements } = useClassAnnouncements(id)
  const createAnnouncementMutation = useCreateAnnouncement(id)
  const updateAnnouncementMutation = useUpdateAnnouncement(id)
  const deleteAnnouncementMutation = useDeleteAnnouncement(id)
  const createCommentMutation = useCreateComment(id)
  const deleteCommentMutation = useDeleteComment(id)

  const [announcementContent, setAnnouncementContent] = useState('')
  const [commentContents, setCommentContents] = useState<Record<string, string>>({})
  const [isComposerExpanded, setIsComposerExpanded] = useState(false)

  // 3-dots actions & edit states
  const [openActionAnnId, setOpenActionAnnId] = useState<string | null>(null)
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null)
  const [editingAnnContent, setEditingAnnContent] = useState('')
  const [expandedCommentAnnId, setExpandedCommentAnnId] = useState<string | null>(null)
  const [replyParentCommentId, setReplyParentCommentId] = useState<Record<string, string | null>>({})

  // Inline homework submission states
  const [inlineSubmissionMode, setInlineSubmissionMode] = useState<'link' | 'text'>('link')
  const [inlineLinkUrl, setInlineLinkUrl] = useState('')
  const [inlineTextContent, setInlineTextContent] = useState('')
  const [isEditingInlineSub, setIsEditingInlineSub] = useState(false)

  useEffect(() => {
    if (selectedAssignment) {
      const sub = selectedAssignment.submission
      if (sub) {
        setInlineLinkUrl(sub.fileUrl ?? '')
        setInlineTextContent(sub.submissionText ?? '')
        setInlineSubmissionMode(sub.fileUrl ? 'link' : 'text')
        setIsEditingInlineSub(false)
      } else {
        setInlineLinkUrl('')
        setInlineTextContent('')
        setInlineSubmissionMode('link')
        setIsEditingInlineSub(true)
      }
    }
  }, [selectedAssignment])

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
          alert(err?.response?.data?.message || 'Không thể đăng thông báo')
        }
      }
    )
  }

  const handleDeleteAnnouncement = (annId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return
    deleteAnnouncementMutation.mutate(annId, {
      onError: (err: any) => {
        alert(err?.response?.data?.message || 'Không thể xóa thông báo')
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
          alert(err?.response?.data?.message || 'Không thể cập nhật thông báo')
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
          alert(err?.response?.data?.message || 'Không thể đăng bình luận')
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
          alert(err?.response?.data?.message || 'Không thể xóa bình luận')
        }
      }
    )
  }

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    const isLinkMode = inlineSubmissionMode === 'link'
    const fileUrl = isLinkMode ? inlineLinkUrl.trim() : ''
    const fileName = isLinkMode ? 'Link bài làm' : ''
    const submissionText = inlineTextContent.trim()

    if (isLinkMode && !fileUrl) {
      alert('Vui lòng nhập đường dẫn bài làm!')
      return
    }
    if (!isLinkMode && !submissionText) {
      alert('Vui lòng nhập nội dung tự luận!')
      return
    }

    submitAssignmentMutation.mutate(
      {
        submissionText,
        fileUrl,
        fileName
      },
      {
        onSuccess: () => {
          alert('Nộp bài thành công!')
          setIsEditingInlineSub(false)
        },
        onError: (err: any) => {
          alert(err?.response?.data?.message || 'Có lỗi xảy ra khi nộp bài!')
        }
      }
    )
  }

  const MEMBER_PAGE_SIZE = 10
  const totalMembers = cls?.members.length ?? 0
  const totalMemberPages = Math.ceil(totalMembers / MEMBER_PAGE_SIZE)
  const activeMemberPage = Math.min(Math.max(1, memberPage), Math.max(1, totalMemberPages))
  const paginatedMembers = cls?.members.slice(
    (activeMemberPage - 1) * MEMBER_PAGE_SIZE,
    activeMemberPage * MEMBER_PAGE_SIZE
  ) ?? []

  const handleDelete = () => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa lớp học?',
      message: 'Bạn có chắc chắn muốn xoá lớp học này? Hành động này sẽ không thể khôi phục.',
      onConfirm: () => {
        deleteClass(id, { onSuccess: () => navigate('/classes') })
        setDeleteConfirm(prev => ({ ...prev, show: false }))
      }
    })
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

  const startEdit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!cls) return
    setEditError('')
    setUpdateSuccess(false)
    setEditForm({
      name: cls.name,
      categoryId: cls.categoryId,
      teacherId: cls.teacherId,
      status: cls.status,
      monthlyFee: cls.monthlyFee ?? 0,
      scheduleDays: cls.scheduleDays ?? '',
      scheduleTime: cls.scheduleTime ?? '',
      room: cls.room ?? '',
      note: cls.note ?? '',
      maxStudents: cls.maxStudents ?? undefined,
      endDate: cls.endDate ? cls.endDate.split('T')[0] : undefined,
      startDate: cls.startDate ? cls.startDate.split('T')[0] : undefined,
    })
  }

  const handleSaveClassInfo = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!editForm) return
    if (!editForm.name?.trim()) {
      setEditError('Tên lớp học không được để trống')
      return
    }
    setEditError('')
    update(editForm, {
      onSuccess: () => {
        setEditForm(null)
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 3500)
      },
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
          guestTeacherId: sessionForm.guestTeacherId || undefined
        }
      }, {
        onSuccess: () => {
          setEditingSession(null)
          setShowAddSession(false)
        }
      })
    } else {
      createSessionMutation.mutate({
        sessionNumber: sessionForm.sessionNumber,
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        topic: sessionForm.topic,
        note: sessionForm.note,
        guestTeacherId: sessionForm.guestTeacherId || undefined
      }, {
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
      note: '',
      guestTeacherId: ''
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
      note: s.note ?? '',
      guestTeacherId: s.guestTeacherId ?? ''
    })
    setShowAddSession(true)
  }

  const handleDeleteSession = (sessionId: string) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa buổi học?',
      message: 'Bạn có chắc muốn xóa buổi học này và tất cả tài liệu đính kèm?',
      onConfirm: () => {
        deleteSessionMutation.mutate(sessionId)
        setDeleteConfirm(prev => ({ ...prev, show: false }))
      }
    })
  }

  // Document handlers
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docForm.fileUrl) {
      alert('Vui lòng nhập đường dẫn tài liệu!')
      return
    }
    createDocMutation.mutate({
      ...docForm,
      sessionId: selectedSessionForDoc ?? undefined,
      shareClassIds: shareClassIds.length > 0 ? shareClassIds : undefined
    }, {
      onSuccess: () => {
        setShowAddDoc(false)
        setDocForm({
          title: '',
          fileUrl: '',
          fileType: 'pdf',
          fileSizeKb: 100
        })
        setShareClassIds([])
      }
    })
  }

  const handleDeleteDoc = (docId: string) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa tài liệu?',
      message: 'Bạn có chắc muốn xóa tài liệu này?',
      onConfirm: () => {
        deleteDocMutation.mutate(docId)
        setDeleteConfirm(prev => ({ ...prev, show: false }))
      }
    })
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
    setDeleteConfirm({
      show: true,
      title: 'Xóa bài tập?',
      message: 'Bạn có chắc muốn xóa bài tập này?',
      onConfirm: () => {
        deleteAssignmentMutation.mutate(assignmentId)
        setDeleteConfirm(prev => ({ ...prev, show: false }))
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
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate('/classes')}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-gray-900 truncate" title={cls.name}>
                {cls.name}
              </h1>
              <span
                className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: cls.categoryColorHex }}
              >
                {cls.categoryName}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
                {STATUS_LABEL[cls.status] ?? cls.status}
              </span>
              {cls.monthlyFee > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                  <CreditCard className="h-3 w-3 text-amber-600" />
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-gray-500 bg-gray-150 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                  <CreditCard className="h-3 w-3 text-gray-400" />
                  Chưa đặt học phí
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 font-medium">
              <span>Giáo viên: <span className="font-bold text-gray-600">{cls.teacherName}</span></span>
              {cls.room && (
                <>
                  <span>•</span>
                  <span>Phòng: <span className="font-bold text-gray-600">{cls.room}</span></span>
                </>
              )}
              {(cls.scheduleDays || cls.scheduleTime) && (
                <>
                  <span>•</span>
                  <span>Lịch học: <span className="font-bold text-gray-600">{cls.scheduleDays} {cls.scheduleTime}</span></span>
                </>
              )}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-xl text-gray-455 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="Xoá lớp học"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            tab === 'announcements'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Bảng tin
        </button>

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

        {isTeacher && (
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
        )}

        {isTeacher && (
          <button
            onClick={() => setTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
              tab === 'members'
                ? 'border-amber-500 text-amber-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Điểm danh & Thành viên
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${tab === 'members' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
              {cls.members.length}
            </span>
          </button>
        )}

        {isTeacher && (
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
        )}
      </div>

      {/* ── 0. Announcements tab (Bảng tin) ── */}
      {tab === 'announcements' && (
        <div className="space-y-6 text-left w-full">
          {/* Class Banner Card (Google Classroom style) */}
          <div className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-amber-600 via-amber-800 to-slate-900 p-8 text-white min-h-[140px] md:min-h-[180px] flex flex-col justify-end">
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-amber-400 to-transparent pointer-events-none" />
            <div className="z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/30 border border-amber-300/30 text-amber-200 px-2.5 py-0.5 rounded-full mb-2.5 inline-block">
                {cls.categoryName || 'Lớp học'}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm mb-1">{cls.name}</h2>
              <p className="text-xs md:text-sm text-amber-200/90 font-medium flex items-center gap-1.5 mt-1.5">
                <span>Giáo viên chính: <strong>{cls.teacherName}</strong></span>
                <span className="text-amber-400/60">•</span>
                <span>Sĩ số: <strong>{cls.members.length} học viên</strong></span>
                <span className="text-amber-400/60">•</span>
                <span>Số buổi học: <strong>{sessions.length} buổi</strong></span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left sidebar info box on large screens */}
            {isStudent && (
              <div className="space-y-4 md:col-span-1 hidden md:block">
                <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
                  <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Sắp diễn ra
                  </h3>
                  {(() => {
                    const todoAssignments = assignments.filter(a => !a.submission)
                    
                    if (todoAssignments.length === 0) {
                      return (
                        <div className="text-center py-2">
                          <Check className="h-5 w-5 text-emerald-500 mx-auto mb-1.5 animate-bounce" />
                          <p className="text-[11px] text-emerald-600 font-extrabold">Tuyệt vời!</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Bạn đã hoàn thành tất cả bài tập.</p>
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
                        <p className="text-[10px] text-gray-400 font-semibold mb-2">Bạn có {todoAssignments.length} bài tập chưa hoàn thành:</p>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none">
                          {sortedTodo.slice(0, 4).map((a) => {
                            const isOverdue = a.dueDate && new Date(a.dueDate).getTime() < Date.now()
                            return (
                              <div 
                                key={a.id} 
                                onClick={() => setTab('assignments')}
                                className="text-left p-2 rounded-xl bg-gray-50/50 hover:bg-amber-50/30 border border-gray-150/60 hover:border-amber-200/50 cursor-pointer transition-all duration-250"
                              >
                                <div className="font-bold text-gray-900 text-xs truncate" title={a.title}>
                                  {a.title}
                                </div>
                                <div className="flex items-center justify-between mt-1 gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    isOverdue 
                                      ? "bg-red-50 text-red-600 border border-red-100" 
                                      : "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {isOverdue ? "Quá hạn" : "Chưa nộp"}
                                  </span>
                                  {a.dueDate ? (
                                    <span className="text-[9px] text-gray-400 font-semibold">
                                      Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-gray-400 font-semibold">Không hạn</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <button 
                          onClick={() => setTab('assignments')}
                          className="w-full text-center mt-1 py-1.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50/50 rounded-xl transition-colors"
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
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                  {!isComposerExpanded ? (
                    // Collapsed form
                    <div 
                      onClick={() => setIsComposerExpanded(true)}
                      className="p-4 flex items-center gap-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-extrabold shadow-inner shrink-0">
                        {user?.fullName?.split(' ').slice(-1)[0][0]?.toUpperCase() ?? 'GV'}
                      </div>
                      <span className="text-xs font-semibold text-gray-400 flex-1">
                        Thông báo điều gì đó cho lớp học của bạn...
                      </span>
                      <Megaphone className="h-4 w-4 text-gray-400" />
                    </div>
                  ) : (
                    // Expanded composer form
                    <form onSubmit={handlePostAnnouncement} className="p-5 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-inner">
                            {user?.fullName?.split(' ').slice(-1)[0][0]?.toUpperCase() ?? 'GV'}
                          </div>
                          <span className="text-xs font-bold text-gray-800">{user?.fullName}</span>
                        </div>

                        {/* Format buttons toolbar */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/70 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleFormat('bold')}
                            className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                            title="In đậm (Ctrl+B)"
                          >
                            <Bold className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('italic')}
                            className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                            title="In nghiêng (Ctrl+I)"
                          >
                            <Italic className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('underline')}
                            className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
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
                          className="w-full min-h-[120px] p-4 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-gray-50/20 focus:bg-white transition-all font-medium leading-relaxed outline-none"
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
                            className="font-bold rounded-xl text-xs px-4 h-9 text-gray-500 hover:text-gray-900"
                          >
                            Hủy bỏ
                          </Button>
                          <Button
                            type="submit"
                            disabled={createAnnouncementMutation.isPending}
                            className="font-bold rounded-xl text-xs px-5 h-9 bg-amber-500 hover:bg-amber-600 text-gray-900 gap-1.5 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            {createAnnouncementMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-900" />
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                Đăng thông báo
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Loading announcements */}
              {loadingAnnouncements ? (
                <div className="bg-white border border-gray-200/85 rounded-2xl p-20 flex justify-center items-center shadow-sm">
                  <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-16 text-center shadow-sm">
                  <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-800 text-sm">Bảng tin chưa có thông báo nào</h3>
                  <p className="text-xs text-gray-400 mt-1">Các thông báo lớp học và bài đăng thảo luận sẽ hiển thị ở đây.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {announcements.map((ann) => {
                    const commentVal = commentContents[ann.id] ?? ''
                    const creatorInitials = ann.creatorName
                      ?.split(' ')
                      .slice(-2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase() ?? 'U'

                    const isAuthor = ann.createdBy === user?.id
                    const canDeleteAnn = isStaff || isAuthor

                    return (
                      <div 
                        key={ann.id} 
                        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300/80 transition-all duration-300"
                      >
                        {/* Announcement Header */}
                        <div className="p-5 flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner ${
                            ann.creatorRole === 'Admin'
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : ann.creatorRole === 'Teacher'
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {creatorInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-gray-900">{ann.creatorName}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                ann.creatorRole === 'Admin'
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : ann.creatorRole === 'Teacher'
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-blue-50 text-blue-600 border border-blue-100"
                              }`}>
                                {ann.creatorRole === 'Admin' ? 'Admin' : ann.creatorRole === 'Teacher' ? 'Giáo viên' : 'Học viên'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">
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
                                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors shrink-0"
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
                                  <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white border border-gray-150 shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                                    {(isAuthor || isAdmin) && (
                                      <button
                                        onClick={() => {
                                          setOpenActionAnnId(null)
                                          setEditingAnnId(ann.id)
                                          setEditingAnnContent(ann.content)
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
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
                        <div className="px-5 pb-5 border-b border-gray-100">
                          {editingAnnId === ann.id ? (
                            <form onSubmit={(e) => handleUpdateAnnouncement(ann.id, e)} className="space-y-3.5 pt-2">
                              {/* Edit toolbar */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Chế độ chỉnh sửa</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/70 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('bold', `edit-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="In đậm"
                                  >
                                    <Bold className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('italic', `edit-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="In nghiêng"
                                  >
                                    <Italic className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('underline', `edit-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
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
                                className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-gray-50/20 focus:bg-white transition-all font-medium leading-relaxed outline-none"
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
                                  className="font-bold rounded-xl text-xs px-4 h-8 text-gray-500 hover:text-gray-900"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={updateAnnouncementMutation.isPending}
                                  className="font-bold rounded-xl text-xs px-5 h-8 bg-amber-500 hover:bg-amber-600 text-gray-900 gap-1.5 shadow-sm"
                                >
                                  {updateAnnouncementMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-900" />
                                  ) : (
                                    "Lưu thay đổi"
                                  )}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div 
                              className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium break-words text-left"
                              dangerouslySetInnerHTML={{ __html: formatContent(ann.content) }}
                            />
                          )}
                        </div>

                        {/* Comments List Section */}
                        <div className="bg-gray-50/50 px-5 py-4 space-y-4">
                          {ann.comments.length > 0 && (() => {
                            const rootComments = ann.comments.filter(c => !c.parentCommentId)
                            const getRepliesForRoot = (rootId: string) => 
                              ann.comments.filter(c => c.parentCommentId === rootId)

                            return (
                              <div className="space-y-4 border-b border-gray-150/70 pb-4 mb-4 empty:hidden">
                                {rootComments.map((comment) => {
                                  const cInitials = comment.creatorName
                                    ?.split(' ')
                                    .slice(-2)
                                    .map((w) => w[0])
                                    .join('')
                                    .toUpperCase() ?? 'U'

                                  const isCommentAuthor = comment.createdBy === user?.id
                                  const canDeleteComment = isStaff || isCommentAuthor
                                  const replies = getRepliesForRoot(comment.id)

                                  return (
                                    <div key={comment.id} className="space-y-3.5">
                                      {/* Root comment card */}
                                      <div className="flex items-start gap-3 group/comment text-xs">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs border ${
                                          comment.creatorRole === 'Admin'
                                            ? "bg-red-50 text-red-600 border-red-100"
                                            : comment.creatorRole === 'Teacher'
                                            ? "bg-amber-50 text-amber-700 border-amber-100"
                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                        }`}>
                                          {cInitials}
                                        </div>
                                        <div className="flex-1 min-w-0 relative">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-extrabold text-gray-950">{comment.creatorName}</span>
                                            <span className={`text-[8px] font-bold scale-90 px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                                              comment.creatorRole === 'Admin'
                                                ? "bg-red-50 text-red-600"
                                                : comment.creatorRole === 'Teacher'
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-blue-50 text-blue-600"
                                            }`}>
                                              {comment.creatorRole === 'Admin' ? 'Admin' : comment.creatorRole === 'Teacher' ? 'GV' : 'HV'}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-semibold ml-1.5">
                                              {new Date(comment.createdAt).toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <div 
                                            className="text-gray-700 font-medium whitespace-pre-line leading-relaxed pr-6 mt-1 break-words text-left"
                                            dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
                                          />

                                          <div className="flex items-center gap-3 mt-1 select-none">
                                            <button
                                              type="button"
                                              onClick={() => handleReplyToComment(ann.id, comment.creatorName, comment.id)}
                                              className="text-[10px] font-bold text-gray-400 hover:text-amber-600 transition-colors"
                                            >
                                              Trả lời
                                            </button>
                                          </div>
                                          
                                          {canDeleteComment && (
                                            <button
                                              onClick={() => handleDeleteComment(ann.id, comment.id)}
                                              className="absolute right-0 top-0.5 opacity-0 group-hover/comment:opacity-100 hover:text-red-500 text-gray-400 transition-opacity p-0.5 rounded"
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
                                          {replies.map((reply) => {
                                            const rInitials = reply.creatorName
                                              ?.split(' ')
                                              .slice(-2)
                                              .map((w) => w[0])
                                              .join('')
                                              .toUpperCase() ?? 'U'

                                            const isReplyAuthor = reply.createdBy === user?.id
                                            const canDeleteReply = isStaff || isReplyAuthor

                                            return (
                                              <div key={reply.id} className="flex items-start gap-3 group/comment text-xs">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs border ${
                                                  reply.creatorRole === 'Admin'
                                                    ? "bg-red-50 text-red-600 border-red-100"
                                                    : reply.creatorRole === 'Teacher'
                                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                                }`}>
                                                  {rInitials}
                                                </div>
                                                <div className="flex-1 min-w-0 relative">
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-extrabold text-gray-950">{reply.creatorName}</span>
                                                    <span className={`text-[8px] font-bold scale-90 px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                                                      reply.creatorRole === 'Admin'
                                                        ? "bg-red-50 text-red-600"
                                                        : reply.creatorRole === 'Teacher'
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-blue-50 text-blue-600"
                                                    }`}>
                                                      {reply.creatorRole === 'Admin' ? 'Admin' : reply.creatorRole === 'Teacher' ? 'GV' : 'HV'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-semibold ml-1.5">
                                                      {new Date(reply.createdAt).toLocaleString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })}
                                                    </span>
                                                  </div>
                                                  <div 
                                                    className="text-gray-700 font-medium whitespace-pre-line leading-relaxed pr-6 mt-1 break-words text-left"
                                                    dangerouslySetInnerHTML={{ __html: formatContent(reply.content) }}
                                                  />

                                                  <div className="flex items-center gap-3 mt-1 select-none">
                                                    <button
                                                      type="button"
                                                      onClick={() => handleReplyToComment(ann.id, reply.creatorName, comment.id, reply.parentCommentId)}
                                                      className="text-[10px] font-bold text-gray-400 hover:text-amber-600 transition-colors"
                                                    >
                                                      Trả lời
                                                    </button>
                                                  </div>
                                                  
                                                  {canDeleteReply && (
                                                    <button
                                                      onClick={() => handleDeleteComment(ann.id, reply.id)}
                                                      className="absolute right-0 top-0.5 opacity-0 group-hover/comment:opacity-100 hover:text-red-500 text-gray-400 transition-opacity p-0.5 rounded"
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

                          {/* Comment Input Form */}
                          {expandedCommentAnnId === ann.id ? (
                            // Expanded comment editor
                            <form onSubmit={(e) => handlePostComment(ann.id, e)} className="space-y-3 pt-2 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Viết bình luận</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white p-0.5 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('bold', `comment-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="In đậm"
                                  >
                                    <Bold className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('italic', `comment-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="In nghiêng"
                                  >
                                    <Italic className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFormat('underline', `comment-editor-${ann.id}`)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="Gạch chân"
                                  >
                                    <Underline className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <textarea
                                id={`comment-editor-${ann.id}`}
                                value={commentVal}
                                onChange={(e) => setCommentContents(prev => ({ ...prev, [ann.id]: e.target.value }))}
                                placeholder="Viết bình luận chi tiết cho lớp học..."
                                className="w-full min-h-[80px] p-3 text-xs rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white focus:bg-white transition-all font-medium leading-relaxed outline-none shadow-xs text-left"
                                required
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setExpandedCommentAnnId(null)
                                    setCommentContents(prev => ({ ...prev, [ann.id]: '' }))
                                  }}
                                  className="font-bold rounded-xl text-[10px] px-4 h-8 text-gray-500 hover:text-gray-900"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={createCommentMutation.isPending}
                                  className="font-bold rounded-xl text-[10px] px-5 h-8 bg-amber-500 hover:bg-amber-600 text-gray-900 gap-1.5 shadow-sm"
                                >
                                  {createCommentMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-gray-900" />
                                  ) : (
                                    <>
                                      <Send className="h-3 w-3" />
                                      Bình luận
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            // Collapsed comment form
                            <form onSubmit={(e) => handlePostComment(ann.id, e)} className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={commentVal}
                                onChange={(e) => setCommentContents(prev => ({ ...prev, [ann.id]: e.target.value }))}
                                placeholder="Viết bình luận lớp học..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:border-amber-500 focus:ring-amber-500/20 shadow-xs h-9 outline-none transition-all text-left"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setExpandedCommentAnnId(ann.id)}
                                className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0 flex items-center justify-center h-9 w-9 border border-gray-200 bg-white shadow-xs"
                                title="Mở rộng khung soạn thảo Rich Text"
                              >
                                <Sparkles className="h-4 w-4" />
                              </button>
                              <button
                                type="submit"
                                disabled={createCommentMutation.isPending}
                                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-900 flex items-center justify-center shrink-0 transition-colors shadow-sm disabled:opacity-50 hover:shadow animate-in fade-in"
                                title="Gửi bình luận"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
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
      )}

      {/* ── 1. Lessons tab ── */}
      {tab === 'lessons' && (() => {
        const sortedSessions = [...sessions].sort((a, b) => {
          const dateDiff = new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
          if (dateDiff !== 0) return dateDiff
          return b.sessionNumber - a.sessionNumber
        })
        const isAllExpanded = sortedSessions.length > 0 && sortedSessions.every(s => expandedSessions[s.id])

        const allDocs = [...generalDocuments]
        sessions.forEach(s => {
          if (s.documents) {
            allDocs.push(...s.documents)
          }
        })
        const sortedDocs = [...allDocs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        const latestDoc = sortedDocs.length > 0 ? sortedDocs[0] : null

        return (
          <div className="space-y-6">
            {latestDoc && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-amber-100/80 text-amber-700 rounded-xl">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Tài liệu chuẩn bị cho buổi học tiếp theo</h4>
                    <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{latestDoc.title}</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                      Được chia sẻ lúc: {new Date(latestDoc.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <a
                  href={latestDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 h-9 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-gray-900 text-xs font-bold rounded-xl transition-all duration-200 shrink-0 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Xem / Tải xuống
                </a>
              </div>
            )}

            {/* General Documents Box */}
            <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Tài liệu & Giáo trình chung của lớp
                </h3>
                {isStaff && (
                  <Button size="sm" variant="secondary" onClick={() => { setSelectedSessionForDoc(null); setShowAddDoc(true); }} className="gap-1.5 text-xs font-semibold rounded-xl">
                    <Plus className="h-4 w-4" />
                    Thêm tài liệu chung
                  </Button>
                )}
              </div>
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
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Chương trình học theo từng Unit
                </h3>
                <div className="flex items-center gap-2">
                  {sortedSessions.length > 0 && (
                    <button
                      onClick={() => {
                        if (isAllExpanded) {
                          setExpandedSessions({})
                        } else {
                          const all: Record<string, boolean> = {}
                          sortedSessions.forEach(s => { all[s.id] = true })
                          setExpandedSessions(all)
                        }
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 select-none mr-2"
                    >
                      {isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                    </button>
                  )}
                  {isStaff && (
                    <>
                      {sortedSessions.length === 0 && (
                        <Button size="sm" variant="secondary" onClick={() => setShowImportModal(true)} className="gap-1.5 text-xs font-semibold rounded-xl">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          Nhập từ Khung giáo trình
                        </Button>
                      )}
                      <Button size="sm" onClick={handleOpenAddSession} className="gap-1.5 text-xs font-semibold rounded-xl">
                        <Plus className="h-4 w-4" />
                        Thêm buổi học (Unit)
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {loadingSessions ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
              ) : sortedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-500">Chưa có nội dung buổi học nào</p>
                  <p className="text-xs text-gray-400 mt-0.5">Vui lòng quay lại sau hoặc liên hệ giáo viên</p>
                </div>
              ) : (
                <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-8">
                  {sortedSessions.map((s) => (
                    <div key={s.id} className="relative group/timeline animate-in fade-in duration-300">
                      {/* Circle marker */}
                      <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-white group-hover/timeline:bg-amber-600 transition-colors">
                        {s.sessionNumber}
                      </div>

                      {/* Session content card */}
                      <div 
                        onClick={() => toggleSession(s.id)}
                        className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-sm leading-snug group-hover/timeline:text-amber-600 transition-colors flex items-center gap-1.5">
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
                              {isStudent && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  s.attendanceStatus === 'present'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                                    : s.attendanceStatus === 'absent'
                                    ? "bg-red-50 text-red-700 border-red-150"
                                    : "bg-gray-50 text-gray-500 border-gray-150"
                                }`}>
                                  {s.attendanceStatus === 'present'
                                    ? "Có mặt"
                                    : s.attendanceStatus === 'absent'
                                    ? "Vắng mặt"
                                    : "Chưa điểm danh"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isStaff && (
                              <div className="flex items-center gap-1.5 opacity-0 group-hover/timeline:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleOpenEditSession(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all" title="Sửa buổi học">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDeleteSession(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all" title="Xóa buổi học">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedSessions[s.id] ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedSessions[s.id] && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                            {/* Lesson notes */}
                            {s.note && (
                              <p className="text-xs text-gray-500 leading-relaxed font-semibold p-3 bg-gray-50 rounded-xl border border-gray-100">
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
                            {isStaff && (
                              <SessionAttendance classId={id} sessionId={s.id} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}

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
                const isOverdue = !!(a.dueDate && new Date(a.dueDate) < new Date())
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
                      setStaffViewTab('submissions')
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

      {tab === 'members' && (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 text-left">
          <div className="border-b border-gray-150 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Thành viên lớp học</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Danh sách các học viên đang tham gia lớp</p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-lg">
              Sĩ số: {cls.members.length} học viên
            </span>
          </div>

          {/* Link mời và nút thêm học viên (chỉ Staff mới thấy) */}
          {isStaff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <Button onClick={() => setShowAdd(true)} className="gap-1.5 rounded-xl font-bold text-xs h-9 bg-amber-500 hover:bg-amber-600 text-gray-900 w-full">
                <Plus className="h-4 w-4" />
                Thêm học viên trực tiếp
              </Button>

              {activeInvite ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs h-9">
                    <Link2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate text-gray-600 flex-1 text-[11px] font-mono">{activeInvite.inviteUrl}</span>
                    <button
                      onClick={() => handleCopy(activeInvite.inviteUrl)}
                      className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Sao chép link"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 animate-in zoom-in duration-200" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-amber-600" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowInvite(true)}
                      className="flex-1 h-7 text-[10px] font-bold rounded-lg"
                    >
                      Tạo link mới
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRevokeConfirm(true)}
                      className="flex-1 h-7 text-[10px] font-bold border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg"
                    >
                      Hủy link
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setShowInvite(true)} className="w-full gap-1.5 rounded-xl font-bold text-xs h-9">
                  <Link2 className="h-4 w-4" />
                  Tạo link mời học viên
                </Button>
              )}
            </div>
          )}

          {cls.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-gray-200 border-dashed rounded-xl bg-gray-50/50">
              <Users className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 font-bold text-xs">Chưa có học viên nào tham gia</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                {paginatedMembers.map((m) => (
                  <div key={m.memberId} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/20 hover:bg-amber-50/5 hover:border-amber-200/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/30">
                        <span className="text-xs font-bold text-amber-700">
                          {m.fullName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-gray-900 truncate leading-snug">{m.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isStaff && (
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              show: true,
                              title: 'Xóa học viên khỏi lớp?',
                              message: `Bạn có chắc muốn xóa học viên ${m.fullName} khỏi lớp học này không?`,
                              onConfirm: () => {
                                removeMember(m.memberId)
                                setDeleteConfirm(prev => ({ ...prev, show: false }))
                              }
                            })
                          }}
                          className="p-1.5 rounded-lg text-gray-405 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa khỏi lớp"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalMemberPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-150 mt-3">
                  <p className="text-[10px] font-bold text-gray-400">
                    Trang {activeMemberPage}/{totalMemberPages}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMemberPage(p => Math.max(p - 1, 1))}
                      disabled={activeMemberPage === 1}
                      className="h-7 w-7 p-0 rounded-lg"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMemberPage(p => Math.min(p + 1, totalMemberPages))}
                      disabled={activeMemberPage === totalMemberPages}
                      className="h-7 w-7 p-0 rounded-lg"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'info' && (
        <div className="space-y-6 text-left">
          {/* Success / Error Alerts */}
          {updateSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 max-w-4xl animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Đã cập nhật thông tin lớp học thành công!</span>
            </div>
          )}

          {editError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 max-w-4xl animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {/* Basic Info Card (Tên lớp) */}
          {editForm && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3 max-w-4xl animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-amber-900 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  Tên lớp học <span className="text-red-500">*</span>
                </span>
                <Input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm(p => p ? { ...p, name: e.target.value } : p)}
                  className="font-bold text-gray-950 text-sm rounded-xl bg-white border-amber-300 focus:border-amber-500"
                  placeholder="Nhập tên lớp học..."
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {/* Card 1: Học thuật & Phụ trách */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <h4 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <GraduationCap className="h-4.5 w-4.5 text-amber-500" />
                Học thuật & Quản lý
              </h4>
              
              <div className="space-y-3.5">
                {/* Danh mục */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Chương trình học</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <select
                        value={editForm.categoryId ?? ''}
                        onChange={(e) => setEditForm(p => p ? { ...p, categoryId: Number(e.target.value) } : p)}
                        className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-2 focus:border-amber-500 focus:ring-amber-500/20"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: cls.categoryColorHex }}
                    >
                      {cls.categoryName}
                    </span>
                  )}
                </div>

                {/* Giáo viên */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Giáo viên phụ trách</span>
                  {editForm && isStaff ? (
                    <div className="w-56 shrink-0">
                      <TeacherSelect
                        value={editForm.teacherId ?? ''}
                        onChange={(val) => setEditForm(p => p ? { ...p, teacherId: val } : p)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700">
                          {cls.teacherName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">{cls.teacherName}</span>
                    </div>
                  )}
                </div>

                {/* Ngày khai giảng */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Ngày bắt đầu</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <Input
                        type="date"
                        value={editForm.startDate ?? ''}
                        onChange={(e) => setEditForm(p => p ? { ...p, startDate: e.target.value } : p)}
                        className="w-full text-xs font-bold rounded-xl"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {new Date(cls.startDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>

                {/* Ngày kết thúc */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Ngày kết thúc</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <Input
                        type="date"
                        value={editForm.endDate ?? ''}
                        onChange={(e) => setEditForm(p => p ? { ...p, endDate: e.target.value || undefined } : p)}
                        className="w-full text-xs font-bold rounded-xl"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {cls.endDate ? (
                        new Date(cls.endDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-gray-400 italic">Chưa thiết lập</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Trạng thái lớp */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Trạng thái</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <CustomDropdown
                        value={editForm.status ?? 'active'}
                        options={STATUS_OPTIONS.map((s) => ({ id: s, name: STATUS_LABEL[s] }))}
                        onChange={(val) => setEditForm(p => p ? { ...p, status: val } : p)}
                      />
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
                      {STATUS_LABEL[cls.status] ?? cls.status}
                    </span>
                  )}
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
                      const currentDays = editForm
                        ? (editForm.scheduleDays ? editForm.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean) : [])
                        : (cls.scheduleDays ? cls.scheduleDays.split(',').map(d => d.trim()).filter(Boolean) : [])
                      const isSelected = currentDays.includes(day)
                      
                      if (editForm) {
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
                            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold border transition-all ${
                              isSelected
                                ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      }
                      
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
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Khung giờ học</span>
                  {editForm ? (
                    <div className="w-56 shrink-0 flex items-center gap-2">
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
                        className="w-full text-center rounded-xl h-8 text-xs font-bold"
                      />
                      <span className="text-gray-400 text-xs font-medium">đến</span>
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
                        className="w-full text-center rounded-xl h-8 text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs">
                      {cls.scheduleTime || 'Chưa thiết lập'}
                    </span>
                  )}
                </div>

                {/* Phòng học */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Phòng học</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <Input
                        type="text"
                        placeholder="VD: Phòng 201"
                        value={editForm.room ?? ''}
                        onChange={(e) => setEditForm(p => p ? { ...p, room: e.target.value } : p)}
                        className="w-full text-xs font-bold rounded-xl h-8"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {cls.room || 'Chưa thiết lập'}
                    </span>
                  )}
                </div>

                {/* Học phí mỗi tháng */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Học phí mỗi tháng</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <Input
                        type="number"
                        min="0"
                        step="50000"
                        placeholder="VD: 800000"
                        value={editForm.monthlyFee ?? 0}
                        onChange={(e) => setEditForm(p => p ? { ...p, monthlyFee: Number(e.target.value) || 0 } : p)}
                        className="w-full text-xs font-bold rounded-xl h-8"
                      />
                    </div>
                  ) : (
                    <span className="font-extrabold text-amber-700">
                      {cls.monthlyFee > 0
                        ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}/tháng`
                        : 'Miễn phí / Chưa cấu hình'}
                    </span>
                  )}
                </div>

                {/* Sĩ số */}
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Sĩ số lớp học</span>
                  {editForm ? (
                    <div className="w-56 shrink-0">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Không giới hạn"
                        value={editForm.maxStudents ?? ''}
                        onChange={(e) => setEditForm(p => p ? { ...p, maxStudents: e.target.value ? Number(e.target.value) : undefined } : p)}
                        className="w-full text-xs font-bold rounded-xl h-8"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      {cls.members.length} / {cls.maxStudents ?? '∞'} học viên
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Ghi chú lớp học */}
          {editForm ? (
            <div className="bg-amber-50/30 border border-amber-200/40 rounded-2xl p-5 flex flex-col gap-2 max-w-4xl">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Ghi chú lớp học</h5>
              </div>
              <textarea
                value={editForm.note ?? ''}
                onChange={(e) => setEditForm(p => p ? { ...p, note: e.target.value } : p)}
                placeholder="Ghi chú lớp học..."
                className="w-full min-h-[60px] p-3 text-xs rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
              />
            </div>
          ) : (
            cls.note && (
              <div className="bg-amber-50/30 border border-amber-200/40 rounded-2xl p-5 flex gap-3.5 items-start max-w-4xl">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 shadow-sm border border-amber-200/50 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">Ghi chú lớp học</h5>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{cls.note}</p>
                </div>
              </div>
            )
          )}

          {/* Bottom Action Buttons - Chỉ hiển thị cho Giáo viên và Admin */}
          {isStaff && (
            <div className="pt-2 flex justify-start gap-3 max-w-4xl">
              {editForm ? (
                <>
                  <Button
                    type="button"
                    disabled={updating}
                    onClick={handleSaveClassInfo}
                    className="font-bold rounded-xl text-xs px-5 h-9 bg-amber-500 hover:bg-amber-600 text-gray-900 gap-1.5 shadow-sm"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin text-gray-900" /> : <Save className="h-4 w-4" />}
                    Lưu thay đổi
                  </Button>
                  <Button
                    type="button"
                    onClick={() => { setEditForm(null); setEditError('') }}
                    variant="secondary"
                    className="font-semibold rounded-xl text-xs px-5 h-9"
                  >
                    Hủy bỏ
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={startEdit}
                    variant="secondary"
                    className="font-semibold gap-1.5 rounded-xl text-xs px-4 h-9"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Chỉnh sửa thông tin
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      type="button"
                      onClick={handleDelete}
                      variant="outline"
                      className="font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 rounded-xl text-xs px-4 h-9"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa lớp học
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Tuition tab (Học phí) ── */}
      {tab === 'tuition' && isAdmin && (
        <div className="space-y-6 text-left">
          {/* Tuition Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Học phí mỗi tháng</p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setNewMonthlyFee(cls.monthlyFee ?? 0)
                        setShowMonthlyFeeModal(true)
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                    >
                      Cài đặt
                    </button>
                  )}
                </div>
                <p className="text-xl font-black text-amber-700 mt-1">
                  {cls.monthlyFee > 0
                    ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cls.monthlyFee)}`
                    : 'Chưa cấu hình'}
                </p>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Áp dụng cho mỗi học viên</p>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã đóng tháng này</p>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {cls.members.filter((m) => m.tuitionStatus === 'paid').length} / {cls.members.length} học viên
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Tỷ lệ hoàn tất học phí</p>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Chưa đóng tháng này</p>
              <p className="text-xl font-black text-rose-600 mt-1">
                {cls.members.filter((m) => m.tuitionStatus !== 'paid').length} học viên
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Cần nhắc nhở thanh toán</p>
            </div>
          </div>

          {/* Section 1: Member Current Month Tuition Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Trạng thái học phí thành viên</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  Đánh dấu hoặc cập nhật trạng thái nộp học phí của từng học viên
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-150 rounded-2xl">
              <table className="w-full text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150">
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Học viên</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Trạng thái học phí</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cls.members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center text-xs text-gray-400 font-medium">
                        Lớp học chưa có thành viên nào.
                      </td>
                    </tr>
                  ) : (
                    cls.members.map((member) => {
                      const isPaid = member.tuitionStatus === 'paid'
                      return (
                        <tr key={member.memberId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0 text-xs">
                                {member.avatarUrl ? (
                                  <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  member.fullName.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-xs">{member.fullName}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <Check className="h-3 w-3" /> Đã đóng học phí
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                <XCircle className="h-3 w-3" /> Chưa đóng học phí
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                const nextStatus = isPaid ? 'unpaid' : 'paid'
                                updateTuitionMutation.mutate({
                                  memberId: member.memberId,
                                  tuitionStatus: nextStatus,
                                }, {
                                  onError: (err: any) => {
                                    alert(err?.response?.data?.message || 'Không thể cập nhật học phí!')
                                  }
                                })
                              }}
                              disabled={updateTuitionMutation.isPending}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                isPaid
                                  ? 'bg-white border-gray-200 text-rose-600 hover:bg-rose-50'
                                  : 'bg-amber-500 border-amber-500 text-gray-900 hover:bg-amber-600'
                              }`}
                            >
                              {updateTuitionMutation.isPending ? 'Đang lưu...' : isPaid ? 'Đánh dấu chưa đóng' : 'Đánh dấu đã đóng'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Payment Transaction History & Admin Confirmation */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Lịch sử thanh toán & Xác nhận học phí</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Danh sách các giao dịch đóng học phí của học viên qua VietQR và chuyển khoản
              </p>
            </div>

            <div className="overflow-x-auto border border-gray-150 rounded-2xl">
              <table className="w-full text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150">
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Học viên</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Kỳ học phí</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Số tiền</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Phương thức & Mã GD</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Ngày đóng</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Thao tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingTuitions ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-xs text-gray-400">
                        Đang tải lịch sử giao dịch...
                      </td>
                    </tr>
                  ) : tuitionRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-xs text-gray-400 font-medium">
                        Chưa có lịch sử giao dịch học phí nào cho lớp này.
                      </td>
                    </tr>
                  ) : (
                    tuitionRecords.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors text-xs">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{t.studentName}</p>
                            <p className="text-[10px] text-gray-400">{t.studentEmail}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-800">
                          Tháng {t.month}/{t.year}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-amber-700">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-bold text-gray-700">{t.paymentMethod}</span>
                            {t.transactionCode && (
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t.transactionCode}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(t.paidAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              t.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : t.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}
                          >
                            {t.status === 'paid' ? 'Đã xác nhận' : t.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {t.status !== 'paid' ? (
                            <Button
                              size="sm"
                              disabled={confirmTuitionMutation.isPending}
                              onClick={() => {
                                confirmTuitionMutation.mutate({
                                  paymentId: t.id,
                                  status: 'paid',
                                  note: 'Admin đã xác nhận nhận đủ tiền',
                                })
                              }}
                              className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Xác nhận đã nhận học phí
                            </Button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                              <Check className="h-3.5 w-3.5" /> Đã duyệt
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cài đặt học phí lớp ── */}
      {showMonthlyFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Cài đặt học phí lớp</h3>
                <p className="text-xs text-gray-400">Áp dụng số tiền thu hàng tháng cho học viên</p>
              </div>
              <button
                onClick={() => setShowMonthlyFeeModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Mức học phí hàng tháng (VNĐ)</label>
              <Input
                type="number"
                min={0}
                step={50000}
                value={newMonthlyFee}
                onChange={(e) => setNewMonthlyFee(Number(e.target.value) || 0)}
                placeholder="VD: 800000"
                className="w-full text-sm font-bold rounded-xl"
              />
              <p className="text-[11px] text-gray-400">
                Hiển thị: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(newMonthlyFee)}</strong> / tháng
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => setShowMonthlyFeeModal(false)}
              >
                Hủy
              </Button>
              <Button
                disabled={updating}
                className="flex-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-gray-950"
                onClick={() => {
                  update({ monthlyFee: newMonthlyFee }, {
                    onSuccess: () => setShowMonthlyFeeModal(false)
                  })
                }}
              >
                {updating ? 'Đang lưu...' : 'Lưu học phí'}
              </Button>
            </div>
          </div>
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giáo viên dạy thay (Tùy chọn)</label>
                <CustomDropdown
                  value={sessionForm.guestTeacherId || 'none'}
                  options={[
                    { id: 'none', name: 'Giáo viên chính của lớp' },
                    ...teachersList.map((t) => ({ id: t.userId, name: t.fullName }))
                  ]}
                  onChange={(val) => setSessionForm({ ...sessionForm, guestTeacherId: val === 'none' ? '' : val })}
                />
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
            <h2 className="font-bold text-lg text-gray-900 mb-1 text-left">Thêm tài liệu học tập</h2>
            <p className="text-xs text-gray-400 mb-4 text-left">
              {selectedSessionForDoc 
                ? `Tài liệu này sẽ được đính kèm vào Unit của buổi học.` 
                : 'Tài liệu này sẽ xuất hiện trong phần Giáo trình & Tài liệu chung của lớp.'}
            </p>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Đường dẫn tài liệu (Link Google Drive) *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={docForm.fileUrl}
                    onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                    className="pl-9 rounded-xl text-xs h-10"
                  />
                </div>
                {docForm.fileUrl.includes('drive.google.com') && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <Check className="h-3.5 w-3.5" />
                    Đã nhận dạng liên kết Google Drive!
                  </p>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề tài liệu *</label>
                <Input
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Ví dụ: Tài liệu bổ trợ Nghe Nói IPA"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Định dạng file</label>
                  <CustomDropdown
                    value={docForm.fileType}
                    options={[
                      { id: 'drive', name: 'Google Drive' },
                      { id: 'pdf', name: 'PDF Document (.pdf)' },
                      { id: 'word', name: 'Microsoft Word (.docx)' },
                      { id: 'ppt', name: 'Powerpoint (.pptx)' },
                      { id: 'other', name: 'Link ngoài khác' }
                    ]}
                    onChange={(val) => setDocForm({ ...docForm, fileType: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Dung lượng ước lượng (KB)</label>
                  <Input
                    type="number"
                    min="0"
                    value={docForm.fileSizeKb}
                    onChange={(e) => setDocForm({ ...docForm, fileSizeKb: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {otherActiveClasses.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-left">Chia sẻ tài liệu này với các lớp khác</label>
                  <p className="text-[10px] text-gray-400 font-semibold mb-2 text-left">Chọn lớp học để chia sẻ tài liệu này:</p>
                  <div className="max-h-[120px] overflow-y-auto space-y-2 border border-gray-150 rounded-xl p-3 bg-gray-50/50">
                    {otherActiveClasses.map((c) => {
                      const checked = shareClassIds.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setShareClassIds(shareClassIds.filter((cid) => cid !== c.id));
                              } else {
                                setShareClassIds([...shareClassIds, c.id]);
                              }
                            }}
                            className="rounded text-amber-500 focus:ring-amber-500/20 w-3.5 h-3.5"
                          />
                          <span className="truncate">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl font-bold text-xs h-9" onClick={() => setShowAddDoc(false)}>Huỷ</Button>
                <Button type="submit" disabled={createDocMutation.isPending} className="flex-1 rounded-xl font-bold text-xs h-9">
                  {createDocMutation.isPending ? 'Đang lưu...' : 'Thêm tài liệu'}
                </Button>
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
                  {selectedAssignment.assignmentType === 'Quiz' ? (
                    <Button
                      onClick={() => {
                        const url = `/classes/${id}/assignments/${selectedAssignment.id}/do`
                        navigate(url)
                      }}
                      className="w-full gap-1.5 rounded-xl font-extrabold py-3 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                    >
                      <Send className="h-4 w-4" />
                      {selectedAssignment.submission ? 'Xem chi tiết bài làm & Kết quả' : 'Bắt đầu làm bài trắc nghiệm (Quiz)'}
                    </Button>
                  ) : (
                    // Upload/Essay assignment inline submission workflow
                    <div className="space-y-4 pt-1">
                      {isEditingInlineSub ? (
                        <form onSubmit={handleInlineSubmit} className="space-y-4">
                          {/* Segmented control to choose between link or text */}
                          <div className="flex border border-gray-200 rounded-2xl overflow-hidden p-1 bg-gray-50/50">
                            <button
                              type="button"
                              onClick={() => setInlineSubmissionMode('link')}
                              className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                                inlineSubmissionMode === 'link'
                                  ? 'bg-white shadow-sm text-amber-700'
                                  : 'text-gray-400 hover:text-gray-600'
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
                              className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                                inlineSubmissionMode === 'text'
                                  ? 'bg-white shadow-sm text-amber-700'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              Làm trực tiếp trên Web
                            </button>
                          </div>

                          {inlineSubmissionMode === 'link' ? (
                            <div className="space-y-3">
                              <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Đường dẫn bài làm (Link Google Drive, Canva, Figma...)</label>
                                <Input
                                  value={inlineLinkUrl}
                                  onChange={(e) => setInlineLinkUrl(e.target.value)}
                                  placeholder="Dán link bài làm của bạn tại đây..."
                                  className="rounded-xl h-10 text-xs bg-white border border-gray-200 focus:border-amber-500"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Ghi chú hoặc lời nhắn (tùy chọn)</label>
                                <textarea
                                  value={inlineTextContent}
                                  onChange={(e) => setInlineTextContent(e.target.value)}
                                  placeholder="Nhập lời nhắn gửi giáo viên..."
                                  className="w-full min-h-[90px] p-3 text-xs font-semibold bg-white rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 text-left">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Nội dung bài làm tự luận</label>
                              <textarea
                                value={inlineTextContent}
                                onChange={(e) => setInlineTextContent(e.target.value)}
                                placeholder="Viết bài tự luận hoặc trả lời của bạn trực tiếp tại đây..."
                                className="w-full min-h-[180px] p-4 text-xs font-semibold bg-white rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20"
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
                                className="flex-1 rounded-xl text-xs font-bold"
                              >
                                Hủy bỏ
                              </Button>
                            )}
                            <Button
                              type="submit"
                              disabled={submitAssignmentMutation.isPending}
                              className="flex-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-gray-900"
                            >
                              {submitAssignmentMutation.isPending ? 'Đang gửi...' : 'Nộp bài làm'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        // View mode for already submitted homework
                        (() => {
                          const sub = selectedAssignment.submission
                          if (!sub) return null
                          return (
                            <div className="space-y-4">
                              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-left space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Đã nộp bài thành công</span>
                                  <span className="text-[9px] text-gray-400 font-semibold">
                                    {sub.submittedAt && new Date(sub.submittedAt).toLocaleString('vi-VN')}
                                  </span>
                                </div>

                                {sub.fileUrl ? (
                                  <div className="space-y-2.5">
                                    <div className="text-xs">
                                      <span className="font-bold text-gray-500">Đường dẫn: </span>
                                      <a
                                        href={sub.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 hover:underline font-bold inline-flex items-center gap-1"
                                      >
                                        Mở bài làm (Link liên kết)
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    {sub.submissionText && (
                                      <div className="text-xs text-gray-700 bg-white border border-gray-100 p-2.5 rounded-xl whitespace-pre-wrap font-semibold leading-relaxed">
                                        <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Ghi chú</span>
                                        {sub.submissionText}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-700 bg-white border border-gray-100 p-3 rounded-xl whitespace-pre-wrap font-semibold leading-relaxed max-h-[200px] overflow-y-auto">
                                    <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Nội dung bài làm trực tiếp</span>
                                    {sub.submissionText}
                                  </div>
                                )}
                              </div>

                              {/* Resubmit button if allowed */}
                              {(!selectedAssignment.dueDate || new Date(selectedAssignment.dueDate) > new Date() || selectedAssignment.allowLateSubmission) && (
                                <Button
                                  type="button"
                                  onClick={() => setIsEditingInlineSub(true)}
                                  className="w-full rounded-xl text-xs font-bold bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/50 text-amber-800 transition-colors"
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
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  {/* Tab Selector for Staff */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      type="button"
                      onClick={() => setStaffViewTab('submissions')}
                      className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                        staffViewTab === 'submissions'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Danh sách học viên nộp bài (${submissions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaffViewTab('preview')}
                      className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                        staffViewTab === 'preview'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Xem trước giao diện làm bài
                    </button>
                  </div>

                  {staffViewTab === 'preview' && (
                    <div className="space-y-4 pt-2">
                      <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl">
                        <p className="text-xs text-amber-800 font-bold flex items-center gap-1.5 justify-start">
                          <span className="animate-pulse">✨</span>
                          Giao diện Xem trước: Giáo viên có thể làm thử Quiz/bài tập ở đây (không lưu kết quả thật).
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const url = `/classes/${id}/assignments/${selectedAssignment.id}/do?preview=true`
                          navigate(url)
                        }}
                        className="w-full gap-1.5 rounded-xl font-extrabold py-3 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                      >
                        <Send className="h-4 w-4" />
                        Làm thử bài tập
                      </Button>
                    </div>
                  )}

                  {staffViewTab === 'submissions' && (
                    <>
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
                </>
                  )}</div>
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
      {/* ── Modal Nhập Khung Giáo Trình ── */}
      {showImportModal && (
        <ImportCurriculumModal
          cls={cls}
          templates={templates}
          onClose={() => setShowImportModal(false)}
          onImport={(templateId, startDate, weekdays) => {
            importCurriculumMutation.mutate({
              templateId,
              startDate,
              weekdays
            }, {
              onSuccess: () => {
                setShowImportModal(false)
                alert('Nhập khung giáo trình thành công!')
              },
              onError: (err: any) => {
                alert(err?.response?.data?.message || 'Có lỗi xảy ra khi nhập khung giáo trình')
              }
            })
          }}
          isPending={importCurriculumMutation.isPending}
        />
      )}

      {/* ── Custom Deletion Confirmation Modal ── */}
      {deleteConfirm.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200"
          onClick={() => setDeleteConfirm(prev => ({ ...prev, show: false }))}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4 mx-auto">
              <AlertTriangle className="h-6 w-6 shrink-0" />
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 mb-2">{deleteConfirm.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
              {deleteConfirm.message}
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-semibold"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, show: false }))}
              >
                Quay lại
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm"
                onClick={deleteConfirm.onConfirm}
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ImportCurriculumModalProps {
  cls: any
  templates: any[]
  onClose: () => void
  onImport: (templateId: string, startDate: string, weekdays: number[]) => void
  isPending: boolean
}

function ImportCurriculumModal({ cls, templates, onClose, onImport, isPending }: ImportCurriculumModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [startDate, setStartDate] = useState(cls?.startDate || new Date().toISOString().split('T')[0])
  const [weekdays, setWeekdays] = useState<number[]>([])

  // Pre-fill weekdays based on class schedule days (ScheduleDays is e.g. "T2,T4,T6")
  useEffect(() => {
    if (cls?.scheduleDays) {
      const days: number[] = []
      const scheduleLower = cls.scheduleDays.toLowerCase()
      if (scheduleLower.includes('t2') || scheduleLower.includes('2') || scheduleLower.includes('monday')) days.push(1)
      if (scheduleLower.includes('t3') || scheduleLower.includes('3') || scheduleLower.includes('tuesday')) days.push(2)
      if (scheduleLower.includes('t4') || scheduleLower.includes('4') || scheduleLower.includes('wednesday')) days.push(3)
      if (scheduleLower.includes('t5') || scheduleLower.includes('5') || scheduleLower.includes('thursday')) days.push(4)
      if (scheduleLower.includes('t6') || scheduleLower.includes('6') || scheduleLower.includes('friday')) days.push(5)
      if (scheduleLower.includes('t7') || scheduleLower.includes('7') || scheduleLower.includes('saturday')) days.push(6)
      if (scheduleLower.includes('cn') || scheduleLower.includes('chủ nhật') || scheduleLower.includes('sunday')) days.push(7)
      setWeekdays(days)
    }
  }, [cls])

  const handleToggleWeekday = (day: number) => {
    setWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId) {
      alert('Vui lòng chọn một khung giáo trình mẫu')
      return
    }
    if (weekdays.length === 0) {
      alert('Vui lòng chọn ít nhất một thứ trong tuần để xếp lịch học')
      return
    }
    onImport(selectedTemplateId, startDate, weekdays)
  }

  const weekdayLabels = [
    { label: 'Thứ 2', value: 1 },
    { label: 'Thứ 3', value: 2 },
    { label: 'Thứ 4', value: 3 },
    { label: 'Thứ 5', value: 4 },
    { label: 'Thứ 6', value: 5 },
    { label: 'Thứ 7', value: 6 },
    { label: 'Chủ Nhật', value: 7 },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Nhập Khung Giáo Trình Mẫu
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Khung giáo trình mẫu</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              required
              className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 font-medium"
            >
              <option value="">-- Chọn một khung mẫu --</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplateId && (
              <p className="text-[11px] text-gray-400 leading-normal font-semibold bg-gray-50 p-2.5 rounded-lg">
                {templates.find((t: any) => t.id == selectedTemplateId)?.description || 'Không có mô tả.'}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày bắt đầu học</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-xl"
            />
            <p className="text-[10px] text-gray-400 font-semibold leading-normal">
              Các buổi học sẽ được tự động xếp lịch bắt đầu từ ngày này.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Lịch học hàng tuần</label>
            <div className="flex flex-wrap gap-2">
              {weekdayLabels.map((wd) => {
                const isSelected = weekdays.includes(wd.value)
                return (
                  <button
                    key={wd.value}
                    type="button"
                    onClick={() => handleToggleWeekday(wd.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {wd.label}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">
              (Hệ thống tự động tích sẵn dựa trên lịch học hiện tại của lớp)
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" className="flex-1 rounded-xl text-xs font-semibold h-11" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 rounded-xl text-xs font-semibold h-11">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Đang nhập...
                </>
              ) : (
                'Xác nhận nhập'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

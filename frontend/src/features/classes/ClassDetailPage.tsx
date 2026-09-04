import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  useClasses, useClassDetail, useUpdateClass, useDeleteClass, useClassCategories,
  useAddMember, useRemoveMember, useCreateInvite, useSearchStudents,
  useActiveInvite, useRevokeInvite,
  useClassSessions, useCreateSession, useUpdateSession, useDeleteSession,
  useCreateDocument, useDeleteDocument,
  useClassAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment,
  useCurriculumTemplates, useImportCurriculum,
  useUpdateMemberTuition,
  useClassTuitions, useConfirmTuitionPayment,
  useAssignmentSubmissions, useGradeSubmission, useSubmitAssignment,
} from './useClasses'
import type {
  UpdateClassRequest, ClassSession, ClassAssignment, AssignmentSubmission,
  AssignmentQuestion, StudentAnswer
} from './classes.types'
import { toast } from '@/shared/utils/toast'
import { classesApi } from './classes.api'
import { useTeachers } from '@/features/teachers/useTeachers'
import {
  PageLayout,
  ScrollablePageLayout,
  LoadingState,
  EmptyState,
} from '@/shared/components'

import {
  ClassDetailHeader,
  ClassDetailTabs,
  AnnouncementsTab,
  LessonsTab,
  DocumentsTab,
  AssignmentsTab,
  MembersTab,
  TuitionTab,
  PaymentHistoryTab,
  InfoTab,
  MonthlyFeeModal,
  AddMemberModal,
  InviteModal,
  RevokeInviteModal,
  AddSessionModal,
  AddDocumentModal,
  AddAssignmentModal,
  AssignmentDetailModal,
  GradeSubmissionModal,
  ImportCurriculumModal,
  DeleteConfirmModal,
} from './components/class-detail'
import type { Tab } from './components/class-detail'

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const isStudent = user?.roles.includes('Student') ?? false
  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  const isStaff = isAdmin || isTeacher

  const [tab, setTab] = useState<Tab>('announcements')

  // Modals & form states
  const [showAddMember, setShowAdd] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [addError, setAddError] = useState('')
  const [expiryDays, setExpiryDays] = useState(30)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
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
  const [selectedSessionForDoc, setSelectedSessionForDoc] = useState<string | null>(null)
  const [docForm, setDocForm] = useState({
    title: '',
    fileUrl: '',
    fileType: 'pdf',
    fileSizeKb: 100
  })

  useEffect(() => {
    if (docForm.fileUrl.includes('drive.google.com')) {
      setDocForm((prev) => ({ ...prev, fileType: 'drive' }))
    } else if (docForm.fileUrl) {
      const ext = docForm.fileUrl.split('.').pop()?.toLowerCase() || ''
      if (ext === 'pdf') {
        setDocForm((prev) => ({ ...prev, fileType: 'pdf' }))
      } else if (['doc', 'docx'].includes(ext)) {
        setDocForm((prev) => ({ ...prev, fileType: 'word' }))
      } else if (['ppt', 'pptx'].includes(ext)) {
        setDocForm((prev) => ({ ...prev, fileType: 'ppt' }))
      } else {
        setDocForm((prev) => ({ ...prev, fileType: 'other' }))
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
      points: 1
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
    setExpandedSessions((prev) => ({
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const [editForm, setEditForm] = useState<UpdateClassRequest | null>(null)
  const [editError, setEditError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Query Hooks
  const { data: cls, isLoading: loadingClass } = useClassDetail(id)
  const { mutate: update, isPending: updating } = useUpdateClass(id)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass()
  const { mutate: addMember, isPending: adding } = useAddMember(id)
  const { mutate: removeMember } = useRemoveMember(id)
  const updateTuitionMutation = useUpdateMemberTuition(id)
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite()
  const { data: searchResults = [] } = useSearchStudents(searchQ)
  const { data: activeInvite } = useActiveInvite(id)
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

  // Handlers
  const handleDelete = () => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa lớp học?',
      message: 'Bạn có chắc chắn muốn xoá lớp học này? Hành động này sẽ không thể khôi phục.',
      onConfirm: () => {
        deleteClass(id, { onSuccess: () => navigate('/classes') })
        setDeleteConfirm((prev) => ({ ...prev, show: false }))
      }
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
      updateSessionMutation.mutate(
        {
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
        },
        {
          onSuccess: () => {
            setEditingSession(null)
            setShowAddSession(false)
          }
        }
      )
    } else {
      createSessionMutation.mutate(
        {
          sessionNumber: sessionForm.sessionNumber,
          sessionDate: sessionForm.sessionDate,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          topic: sessionForm.topic,
          note: sessionForm.note,
          guestTeacherId: sessionForm.guestTeacherId || undefined
        },
        {
          onSuccess: () => {
            setShowAddSession(false)
          }
        }
      )
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
        setDeleteConfirm((prev) => ({ ...prev, show: false }))
      }
    })
  }

  // Document handlers
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docForm.fileUrl) {
      toast.error('Vui lòng nhập đường dẫn tài liệu!')
      return
    }
    createDocMutation.mutate(
      {
        ...docForm,
        sessionId: selectedSessionForDoc ?? undefined,
        shareClassIds: shareClassIds.length > 0 ? shareClassIds : undefined
      },
      {
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
      }
    )
  }

  const handleDeleteDoc = (docId: string) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa tài liệu?',
      message: 'Bạn có chắc muốn xóa tài liệu này?',
      onConfirm: () => {
        deleteDocMutation.mutate(docId)
        setDeleteConfirm((prev) => ({ ...prev, show: false }))
      }
    })
  }

  // Assignment handlers
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedQuestions = assignmentQuestions.map((q) => {
      if (q.type === 'FillInTheBlank') {
        const match = q.questionText.match(/\[([^\]]+)\]/)
        if (match && match[1]) {
          const options = match[1].split(/[\/|]/).map((o) => o.trim())
          if (options.length > 0) {
            return { ...q, correctAnswer: options[0] }
          }
        }
      }
      return q
    })

    const questionsJson = assignmentForm.assignmentType === 'Quiz' ? JSON.stringify(parsedQuestions) : null

    if (editingAssignment) {
      updateAssignmentMutation.mutate(
        {
          assignmentId: editingAssignment.id,
          body: {
            title: assignmentForm.title,
            description: assignmentForm.description,
            dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toISOString() : null,
            assignmentType: assignmentForm.assignmentType,
            allowLateSubmission: assignmentForm.allowLateSubmission,
            questionsJson: questionsJson ?? undefined
          }
        },
        {
          onSuccess: () => {
            setEditingAssignment(null)
            setShowAddAssignment(false)
          }
        }
      )
    } else {
      createAssignmentMutation.mutate(
        {
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toISOString() : undefined,
          assignmentType: assignmentForm.assignmentType,
          allowLateSubmission: assignmentForm.allowLateSubmission,
          questionsJson: questionsJson ?? undefined
        },
        {
          onSuccess: () => {
            setShowAddAssignment(false)
          }
        }
      )
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
        setDeleteConfirm((prev) => ({ ...prev, show: false }))
      }
    })
  }

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    const isLinkMode = inlineSubmissionMode === 'link'
    const fileUrl = isLinkMode ? inlineLinkUrl.trim() : ''
    const fileName = isLinkMode ? 'Link bài làm' : ''
    const submissionText = inlineTextContent.trim()

    if (isLinkMode && !fileUrl) {
      toast.error('Vui lòng nhập đường dẫn bài làm!')
      return
    }
    if (!isLinkMode && !submissionText) {
      toast.error('Vui lòng nhập nội dung tự luận!')
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
          toast.success('Nộp bài thành công!')
          setIsEditingInlineSub(false)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi nộp bài!')
        }
      }
    )
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

  const handleWritingGradeChange = (questionId: string, value: number) => {
    const currentAnswers = gradeForm.answersJson ? (JSON.parse(gradeForm.answersJson) as StudentAnswer[]) : []
    const updated = currentAnswers.map((ans) => {
      if (ans.questionId === questionId) {
        return { ...ans, grade: value }
      }
      return ans
    })

    const questions: AssignmentQuestion[] = selectedAssignment?.questionsJson
      ? JSON.parse(selectedAssignment.questionsJson)
      : []
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
    const currentAnswers = gradeForm.answersJson ? (JSON.parse(gradeForm.answersJson) as StudentAnswer[]) : []
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

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return
    gradeSubmissionMutation.mutate(
      {
        submissionId: selectedSubmission.id,
        body: {
          grade: gradeForm.grade,
          teacherFeedback: gradeForm.teacherFeedback,
          answersJson: gradeForm.answersJson || undefined
        }
      },
      {
        onSuccess: () => {
          setShowGradeModal(false)
          setSelectedSubmission(null)
          if (selectedAssignment) {
            classesApi.getAssignmentDetail(selectedAssignment.id).then((updatedAssign) => {
              setSelectedAssignment(updatedAssign)
            })
          }
          toast.success('Chấm điểm thành công!')
        }
      }
    )
  }

  const handleImportCurriculum = (templateId: string, startDate: string, weekdays: number[]) => {
    importCurriculumMutation.mutate(
      { templateId, startDate, weekdays },
      {
        onSuccess: () => {
          setShowImportModal(false)
          toast.success('Nhập giáo trình mẫu thành công!')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi nhập giáo trình!')
        }
      }
    )
  }

  if (loadingClass) {
    return (
      <PageLayout>
<LoadingState variant="skeleton-cards" rows={2} />
      </PageLayout>
    )
  }

  if (!cls) {
    return (
      <PageLayout>
<EmptyState title="Không tìm thấy lớp học" description="Lớp học không tồn tại hoặc đã bị xóa." />
      </PageLayout>
    )
  }

  return (
    <>
      <ScrollablePageLayout
        header={
          <>
            <ClassDetailHeader cls={cls} />
            <ClassDetailTabs
              activeTab={tab}
              onTabChange={setTab}
              isStaff={isStaff}
              isStudent={isStudent}
              isTeacher={isTeacher}
              isAdmin={isAdmin}
              assignmentsCount={assignments.length}
              membersCount={cls.members.length}
            />
          </>
        }
      >
        <div className="w-full min-h-[400px]">
        {tab === 'announcements' && (
          <AnnouncementsTab
            classId={id}
            cls={cls}
            sessions={sessions}
            assignments={assignments}
            isStaff={isStaff}
            isStudent={isStudent}
            isAdmin={isAdmin}
            user={user}
            onTabChange={setTab}
          />
        )}

        {tab === 'lessons' && (
          <LessonsTab
            classId={id}
            sessions={sessions}
            loadingSessions={loadingSessions}
            isStaff={isStaff}
            isStudent={isStudent}
            expandedSessions={expandedSessions}
            toggleSession={toggleSession}
            setExpandedSessions={setExpandedSessions}
            setSelectedSessionForDoc={setSelectedSessionForDoc}
            setShowAddDoc={setShowAddDoc}
            handleDeleteDoc={handleDeleteDoc}
            setShowImportModal={setShowImportModal}
            handleOpenAddSession={handleOpenAddSession}
            handleOpenEditSession={handleOpenEditSession}
            handleDeleteSession={handleDeleteSession}
          />
        )}

        {tab === 'documents' && (
          <DocumentsTab
            generalDocuments={generalDocuments}
            sessions={sessions}
            isStaff={isStaff}
            setSelectedSessionForDoc={setSelectedSessionForDoc}
            setShowAddDoc={setShowAddDoc}
            handleDeleteDoc={handleDeleteDoc}
          />
        )}

        {tab === 'assignments' && (isStaff || isStudent) && (
          <AssignmentsTab
            assignments={assignments}
            loadingAssignments={loadingAssignments}
            isStaff={isStaff}
            isStudent={isStudent}
            handleOpenAddAssignment={handleOpenAddAssignment}
            handleOpenEditAssignment={handleOpenEditAssignment}
            handleDeleteAssignment={handleDeleteAssignment}
            setSelectedAssignment={setSelectedAssignment}
            setStaffViewTab={setStaffViewTab}
          />
        )}

        {tab === 'members' && isTeacher && (
          <MembersTab
            cls={cls}
            isStaff={isStaff}
            activeInvite={activeInvite}
            copied={copied}
            handleCopy={handleCopy}
            setShowAdd={setShowAdd}
            setShowInvite={setShowInvite}
            setShowRevokeConfirm={setShowRevokeConfirm}
            removeMember={removeMember}
            setDeleteConfirm={setDeleteConfirm}
          />
        )}

        {tab === 'info' && isTeacher && (
          <InfoTab
            cls={cls}
            categories={categories}
            isStaff={isStaff}
            isAdmin={isAdmin}
            editForm={editForm}
            setEditForm={setEditForm}
            editError={editError}
            setEditError={setEditError}
            updateSuccess={updateSuccess}
            updating={updating}
            startEdit={startEdit}
            handleSaveClassInfo={handleSaveClassInfo}
            handleDelete={handleDelete}
          />
        )}

        {tab === 'tuition' && isAdmin && (
          <TuitionTab
            cls={cls}
            isAdmin={isAdmin}
            setShowMonthlyFeeModal={setShowMonthlyFeeModal}
            setNewMonthlyFee={setNewMonthlyFee}
            updateTuitionMutation={updateTuitionMutation}
          />
        )}

        {tab === 'payment-history' && isAdmin && (
          <PaymentHistoryTab
            tuitions={tuitionRecords}
            loadingTuitions={loadingTuitions}
            confirmTuitionMutation={confirmTuitionMutation}
          />
        )}
        </div>
      </ScrollablePageLayout>

      {/* Modals */}
      <MonthlyFeeModal
        show={showMonthlyFeeModal}
        onClose={() => setShowMonthlyFeeModal(false)}
        newMonthlyFee={newMonthlyFee}
        setNewMonthlyFee={setNewMonthlyFee}
        onSave={() => {
          update(
            { monthlyFee: newMonthlyFee },
            {
              onSuccess: () => setShowMonthlyFeeModal(false)
            }
          )
        }}
        updating={updating}
      />

      <AddMemberModal
        show={showAddMember}
        onClose={() => {
          setShowAdd(false)
          setSearchQ('')
          setAddError('')
        }}
        searchQ={searchQ}
        setSearchQ={setSearchQ}
        searchResults={searchResults}
        clsMembers={cls.members.map((m) => ({ studentId: m.memberId }))}
        addError={addError}
        setAddError={setAddError}
        onAddMember={(studentId) => {
          addMember(studentId, {
            onSuccess: () => {
              setShowAdd(false)
              setSearchQ('')
              setAddError('')
            },
            onError: (err: any) => {
              setAddError(err?.response?.data?.message || 'Không thể thêm học viên vào lớp')
            }
          })
        }}
        adding={adding}
      />

      <InviteModal
        show={showInvite}
        onClose={() => setShowInvite(false)}
        expiryDays={expiryDays}
        setExpiryDays={setExpiryDays}
        creatingInvite={creatingInvite}
        onInvite={() => {
          createInvite(
            { classId: id, expiryDays },
            {
              onSuccess: () => setShowInvite(false)
            }
          )
        }}
      />

      <RevokeInviteModal
        show={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        revokingInvite={revokingInvite}
        onRevoke={() => {
          revokeInvite(undefined, {
            onSuccess: () => setShowRevokeConfirm(false)
          })
        }}
      />

      <AddSessionModal
        show={showAddSession}
        onClose={() => setShowAddSession(false)}
        editingSession={editingSession}
        sessionForm={sessionForm}
        setSessionForm={setSessionForm}
        teachersList={teachersList}
        isPending={createSessionMutation.isPending || updateSessionMutation.isPending}
        onSave={handleSaveSession}
      />

      <AddDocumentModal
        show={showAddDoc}
        onClose={() => {
          setShowAddDoc(false)
          setSelectedSessionForDoc(null)
        }}
        selectedSessionForDoc={selectedSessionForDoc}
        docForm={docForm}
        setDocForm={setDocForm}
        otherActiveClasses={otherActiveClasses}
        shareClassIds={shareClassIds}
        setShareClassIds={setShareClassIds}
        isPending={createDocMutation.isPending}
        onSave={handleSaveDoc}
      />

      <AddAssignmentModal
        show={showAddAssignment}
        onClose={() => setShowAddAssignment(false)}
        editingAssignment={editingAssignment}
        assignmentForm={assignmentForm}
        setAssignmentForm={setAssignmentForm}
        assignmentQuestions={assignmentQuestions}
        addQuestion={addQuestion}
        updateQuestion={updateQuestion}
        deleteQuestion={deleteQuestion}
        isPending={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
        onSave={handleSaveAssignment}
      />

      <AssignmentDetailModal
        classId={id}
        selectedAssignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        isStudent={isStudent}
        isStaff={isStaff}
        inlineSubmissionMode={inlineSubmissionMode}
        setInlineSubmissionMode={setInlineSubmissionMode}
        inlineLinkUrl={inlineLinkUrl}
        setInlineLinkUrl={setInlineLinkUrl}
        inlineTextContent={inlineTextContent}
        setInlineTextContent={setInlineTextContent}
        isEditingInlineSub={isEditingInlineSub}
        setIsEditingInlineSub={setIsEditingInlineSub}
        handleInlineSubmit={handleInlineSubmit}
        submitPending={submitAssignmentMutation.isPending}
        staffViewTab={staffViewTab}
        setStaffViewTab={setStaffViewTab}
        submissions={submissions}
        loadingSubmissions={loadingSubmissions}
        handleOpenGrade={handleOpenGrade}
        navigate={navigate}
      />

      <GradeSubmissionModal
        show={showGradeModal}
        onClose={() => {
          setShowGradeModal(false)
          setSelectedSubmission(null)
        }}
        selectedSubmission={selectedSubmission}
        selectedAssignment={selectedAssignment}
        gradeForm={gradeForm}
        setGradeForm={setGradeForm}
        handleWritingGradeChange={handleWritingGradeChange}
        handleWritingFeedbackChange={handleWritingFeedbackChange}
        onGradeSubmit={handleSaveGrade}
        isPending={gradeSubmissionMutation.isPending}
      />

      <ImportCurriculumModal
        show={showImportModal}
        cls={cls}
        templates={templates}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportCurriculum}
        isPending={importCurriculumMutation.isPending}
      />

      <DeleteConfirmModal
        show={deleteConfirm.show}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, show: false }))}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        isPending={deleting}
      />
    </>
  )
}

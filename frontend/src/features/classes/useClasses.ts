import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classesApi } from './classes.api'
import type {
  CreateClassRequest,
  UpdateClassRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateDocumentRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAssignmentRequest,
  GradeSubmissionRequest,
} from './classes.types'

export const CLASSES_KEY = ['classes'] as const

export function useClasses(params?: { search?: string; categoryId?: number; status?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...CLASSES_KEY, params],
    queryFn: () => classesApi.getAll(params),
  })
}

export function useClassDetail(id: string) {
  return useQuery({
    queryKey: [...CLASSES_KEY, id],
    queryFn: () => classesApi.getDetail(id),
    enabled: !!id,
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClassRequest) => classesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useUpdateClass(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateClassRequest) => classesApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLASSES_KEY })
      qc.invalidateQueries({ queryKey: [...CLASSES_KEY, id] })
    },
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useAddMember(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) => classesApi.addMember(classId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CLASSES_KEY, classId] }),
  })
}

export function useRemoveMember(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => classesApi.removeMember(classId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CLASSES_KEY, classId] }),
  })
}

export function useCreateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, expiryDays }: { classId: string; expiryDays: number }) =>
      classesApi.createInvite(classId, expiryDays),
    onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ['classes', variables.classId, 'invite'] }),
  })
}

export function useInviteInfo(token: string) {
  return useQuery({
    queryKey: ['invite', token],
    queryFn: () => classesApi.getInviteInfo(token),
    enabled: !!token,
    retry: false,
  })
}

export function useJoinByInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => classesApi.joinByInvite(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useSearchStudents(q: string) {
  return useQuery({
    queryKey: ['students-search', q],
    queryFn: () => classesApi.searchStudents(q),
    enabled: q.trim().length >= 2,
    staleTime: 5_000,
  })
}

export function useSearchTeachers(q: string = '') {
  return useQuery({
    queryKey: ['teachers-search', q],
    queryFn: () => classesApi.searchTeachers(q),
    staleTime: 15_000,
  })
}

export function useClassCategories() {
  return useQuery({
    queryKey: ['class-categories'],
    queryFn: () => classesApi.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryRequest) => classesApi.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['class-categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCategoryRequest }) => classesApi.updateCategory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-categories'] })
      qc.invalidateQueries({ queryKey: CLASSES_KEY })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => classesApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['class-categories'] }),
  })
}

export function useActiveInvite(classId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'invite'],
    queryFn: () => classesApi.getActiveInvite(classId),
    enabled: !!classId,
  })
}

export function useRevokeInvite(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => classesApi.revokeInvite(classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'invite'] }),
  })
}

// ── SESSIONS HOOKS ──
export function useClassSessions(classId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'sessions'],
    queryFn: () => classesApi.getSessions(classId),
    enabled: !!classId,
  })
}

export function useCreateSession(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSessionRequest) => classesApi.createSession(classId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] }),
  })
}

export function useUpdateSession(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, body }: { sessionId: string; body: UpdateSessionRequest }) =>
      classesApi.updateSession(sessionId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] }),
  })
}

export function useDeleteSession(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => classesApi.deleteSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] }),
  })
}

// ── DOCUMENTS HOOKS ──
export function useCreateDocument(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDocumentRequest) => classesApi.createDocument(classId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] }),
  })
}

export function useDeleteDocument(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => classesApi.deleteDocument(documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] }),
  })
}

// ── ASSIGNMENTS HOOKS ──
export function useClassAssignments(classId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'assignments'],
    queryFn: () => classesApi.getAssignments(classId),
    enabled: !!classId,
  })
}

export function useAssignmentDetail(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId],
    queryFn: () => classesApi.getAssignmentDetail(assignmentId),
    enabled: !!assignmentId,
  })
}

export function useCreateAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAssignmentRequest) => classesApi.createAssignment(classId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'assignments'] }),
  })
}

export function useUpdateAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: string; body: UpdateAssignmentRequest }) =>
      classesApi.updateAssignment(assignmentId, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'assignments'] })
      qc.invalidateQueries({ queryKey: ['assignments', variables.assignmentId] })
    },
  })
}

export function useDeleteAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => classesApi.deleteAssignment(assignmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', classId, 'assignments'] }),
  })
}

// ── SUBMISSIONS HOOKS ──
export function useAssignmentSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId, 'submissions'],
    queryFn: () => classesApi.getAssignmentSubmissions(assignmentId),
    enabled: !!assignmentId,
  })
}

export function useSubmitAssignment(classId: string, assignmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SubmitAssignmentRequest) => classesApi.submitAssignment(assignmentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'assignments'] })
      qc.invalidateQueries({ queryKey: ['assignments', assignmentId] })
    },
  })
}

export function useGradeSubmission(classId: string, assignmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ submissionId, body }: { submissionId: string; body: GradeSubmissionRequest }) =>
      classesApi.gradeSubmission(submissionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'assignments'] })
      qc.invalidateQueries({ queryKey: ['assignments', assignmentId] })
      qc.invalidateQueries({ queryKey: ['assignments', assignmentId, 'submissions'] })
    },
  })
}

export function useCurriculumTemplates() {
  return useQuery({
    queryKey: ['curriculum-templates'],
    queryFn: () => classesApi.getCurriculumTemplates(),
  })
}

export function useImportCurriculum(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { templateId: string; startDate: string; weekdays: number[] }) =>
      classesApi.importCurriculum(classId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'sessions'] })
    },
  })
}

export function useCreateCurriculumTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => classesApi.createCurriculumTemplate(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curriculum-templates'] })
    },
  })
}

export function useDeleteCurriculumTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classesApi.deleteCurriculumTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curriculum-templates'] })
    },
  })
}

export function useClassAttendance(classId: string, sessionId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'attendance', sessionId],
    queryFn: () => classesApi.getAttendance(classId, sessionId),
    enabled: !!classId && !!sessionId,
  })
}

export function useUpdateAttendance(classId: string, sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { studentId: string; status: string }) =>
      classesApi.updateAttendance(classId, sessionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'attendance', sessionId] })
    },
  })
}

export function useClassAnnouncements(classId: string) {
  return useQuery({
    queryKey: ['classes', classId, 'announcements'],
    queryFn: () => classesApi.getAnnouncements(classId),
    enabled: !!classId,
  })
}

export function useCreateAnnouncement(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { content: string }) => classesApi.createAnnouncement(classId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'announcements'] })
    },
  })
}

export function useDeleteAnnouncement(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (announcementId: string) => classesApi.deleteAnnouncement(classId, announcementId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'announcements'] })
    },
  })
}

export function useCreateComment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { announcementId: string; content: string; parentCommentId?: string | null }) =>
      classesApi.createComment(classId, body.announcementId, { content: body.content, parentCommentId: body.parentCommentId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'announcements'] })
    },
  })
}

export function useDeleteComment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { announcementId: string; commentId: string }) =>
      classesApi.deleteComment(classId, body.announcementId, body.commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'announcements'] })
    },
  })
}

export function useUpdateAnnouncement(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { announcementId: string; content: string }) =>
      classesApi.updateAnnouncement(classId, body.announcementId, { content: body.content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', classId, 'announcements'] })
    },
  })
}

export function useAllDocuments(params?: { search?: string }) {
  return useQuery({
    queryKey: ['classes', 'all-documents', params],
    queryFn: () => classesApi.getAllDocuments(params),
  })
}

export function useCreateGlobalDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, body }: { classId: string; body: CreateDocumentRequest }) => classesApi.createDocument(classId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', 'all-documents'] })
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteGlobalDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => classesApi.deleteDocument(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', 'all-documents'] })
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}


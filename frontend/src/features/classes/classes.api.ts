import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type {
  ClassSummary,
  ClassDetail,
  CreateClassRequest,
  UpdateClassRequest,
  InviteInfo,
  InviteLink,
  StudentSearchResult,
  TeacherSearchResult,
  ClassCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  ClassSession,
  ClassDocument,
  ClassAssignment,
  AssignmentSubmission,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateDocumentRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAssignmentRequest,
  GradeSubmissionRequest,
} from './classes.types'

export const classesApi = {
  getAll: (params?: { search?: string; categoryId?: number; status?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResponse<ClassSummary>>>('/classes', { params }).then((r) => r.data.data!),

  getDetail: (id: string) =>
    api.get<ApiResponse<ClassDetail>>(`/classes/${id}`).then((r) => r.data.data!),

  create: (body: CreateClassRequest) =>
    api.post<ApiResponse<ClassSummary>>('/classes', body).then((r) => r.data.data!),

  update: (id: string, body: UpdateClassRequest) =>
    api.put<ApiResponse<null>>(`/classes/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/classes/${id}`).then((r) => r.data),

  addMember: (classId: string, studentId: string) =>
    api.post<ApiResponse<null>>(`/classes/${classId}/members`, { studentId }).then((r) => r.data),

  removeMember: (classId: string, memberId: string) =>
    api.delete<ApiResponse<null>>(`/classes/${classId}/members/${memberId}`).then((r) => r.data),

  searchStudents: (q: string) =>
    api
      .get<ApiResponse<StudentSearchResult[]>>('/classes/students/search', { params: { q } })
      .then((r) => r.data.data ?? []),

  searchTeachers: (q: string) =>
    api
      .get<ApiResponse<TeacherSearchResult[]>>('/classes/teachers/search', { params: { q } })
      .then((r) => r.data.data ?? []),

  createInvite: (classId: string, expiryDays: number) =>
    api
      .post<ApiResponse<InviteLink>>(`/classes/${classId}/invite`, { expiryDays })
      .then((r) => r.data.data!),

  getInviteInfo: (token: string) =>
    api.get<ApiResponse<InviteInfo>>(`/classes/join/${token}`).then((r) => r.data.data!),

  joinByInvite: (token: string) =>
    api.post<ApiResponse<null>>(`/classes/join/${token}`).then((r) => r.data),

  getCategories: () =>
    api.get<ApiResponse<ClassCategory[]>>('/classes/categories').then((r) => r.data.data!),

  createCategory: (body: CreateCategoryRequest) =>
    api.post<ApiResponse<ClassCategory>>('/settings/categories', body).then((r) => r.data.data!),

  updateCategory: (id: number, body: UpdateCategoryRequest) =>
    api.put<ApiResponse<null>>(`/settings/categories/${id}`, body).then((r) => r.data),

  deleteCategory: (id: number) =>
    api.delete<ApiResponse<null>>(`/settings/categories/${id}`).then((r) => r.data),

  getActiveInvite: (classId: string) =>
    api.get<ApiResponse<InviteLink | null>>(`/classes/${classId}/invite`).then((r) => r.data.data),

  revokeInvite: (classId: string) =>
    api.delete<ApiResponse<null>>(`/classes/${classId}/invite`).then((r) => r.data),

  // ── SESSIONS ──
  getSessions: (classId: string) =>
    api.get<ApiResponse<{ sessions: ClassSession[]; generalDocuments: ClassDocument[] }>>(`/classes/${classId}/sessions`).then((r) => r.data.data!),

  createSession: (classId: string, body: CreateSessionRequest) =>
    api.post<ApiResponse<{ id: string }>>(`/classes/${classId}/sessions`, body).then((r) => r.data.data!),

  updateSession: (sessionId: string, body: UpdateSessionRequest) =>
    api.put<ApiResponse<null>>(`/classes/sessions/${sessionId}`, body).then((r) => r.data),

  deleteSession: (sessionId: string) =>
    api.delete<ApiResponse<null>>(`/classes/sessions/${sessionId}`).then((r) => r.data),

  // ── DOCUMENTS ──
  createDocument: (classId: string, body: CreateDocumentRequest) =>
    api.post<ApiResponse<{ id: string }>>(`/classes/${classId}/documents`, body).then((r) => r.data.data!),

  deleteDocument: (documentId: string) =>
    api.delete<ApiResponse<null>>(`/classes/documents/${documentId}`).then((r) => r.data),

  // ── ASSIGNMENTS ──
  getAssignments: (classId: string) =>
    api.get<ApiResponse<ClassAssignment[]>>(`/classes/${classId}/assignments`).then((r) => r.data.data!),

  getAssignmentDetail: (assignmentId: string) =>
    api.get<ApiResponse<ClassAssignment>>(`/classes/assignments/${assignmentId}`).then((r) => r.data.data!),

  createAssignment: (classId: string, body: CreateAssignmentRequest) =>
    api.post<ApiResponse<{ id: string }>>(`/classes/${classId}/assignments`, body).then((r) => r.data.data!),

  updateAssignment: (assignmentId: string, body: UpdateAssignmentRequest) =>
    api.put<ApiResponse<null>>(`/classes/assignments/${assignmentId}`, body).then((r) => r.data),

  deleteAssignment: (assignmentId: string) =>
    api.delete<ApiResponse<null>>(`/classes/assignments/${assignmentId}`).then((r) => r.data),

  // ── SUBMISSIONS ──
  getAssignmentSubmissions: (assignmentId: string) =>
    api.get<ApiResponse<AssignmentSubmission[]>>(`/classes/assignments/${assignmentId}/submissions`).then((r) => r.data.data!),

  submitAssignment: (assignmentId: string, body: SubmitAssignmentRequest) =>
    api.post<ApiResponse<{ id: string }>>(`/classes/assignments/${assignmentId}/submit`, body).then((r) => r.data.data!),

  gradeSubmission: (submissionId: string, body: GradeSubmissionRequest) =>
    api.post<ApiResponse<null>>(`/classes/assignments/submissions/${submissionId}/grade`, body).then((r) => r.data),

  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ fileUrl: string; fileName: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then((r) => r.data.data!)
  }
}

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
} from './classes.types'

export const classesApi = {
  getAll: () =>
    api.get<ApiResponse<ClassSummary[]>>('/classes').then((r) => r.data.data!),

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
}

import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { PaginatedResponse } from '@/features/classes/classes.types'
import type { StudentDetail, CreateStudentRequest, UpdateStudentRequest } from './students.types'

export const studentsApi = {
  getAll: (params?: { search?: string; status?: string; level?: string; goal?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<StudentDetail>>>('/students', { params })
      .then((r) => r.data.data!),

  getDetail: (id: string) =>
    api.get<ApiResponse<StudentDetail>>(`/students/${id}`).then((r) => r.data.data!),

  create: (body: CreateStudentRequest) =>
    api.post<ApiResponse<StudentDetail>>('/students', body).then((r) => r.data.data!),

  update: (id: string, body: UpdateStudentRequest) =>
    api.put<ApiResponse<null>>(`/students/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/students/${id}`).then((r) => r.data),
}

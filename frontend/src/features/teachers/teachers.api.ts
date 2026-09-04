import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { PaginatedResponse } from '@/features/classes/classes.types'
import type { TeacherDetail, CreateTeacherRequest, UpdateTeacherRequest } from './teachers.types'

export const teachersApi = {
  getAll: (params?: { search?: string; type?: string; isActive?: boolean; page?: number; pageSize?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<TeacherDetail>>>('/teachers', { params })
      .then((r) => r.data.data!),

  getDetail: (id: string) =>
    api.get<ApiResponse<TeacherDetail>>(`/teachers/${id}`).then((r) => r.data.data!),

  create: (body: CreateTeacherRequest) =>
    api.post<ApiResponse<TeacherDetail>>('/teachers', body).then((r) => r.data.data!),

  update: (id: string, body: UpdateTeacherRequest) =>
    api.put<ApiResponse<null>>(`/teachers/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/teachers/${id}`).then((r) => r.data),
}

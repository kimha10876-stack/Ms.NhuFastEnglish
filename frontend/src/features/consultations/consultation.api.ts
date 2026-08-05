import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { PaginatedResponse } from '@/features/classes/classes.types'
import type {
  ConsultationRequest,
  CreateConsultationReq,
  UpdateConsultationStatusReq,
} from './consultation.types'

export const consultationApi = {
  // Public
  createConsultation: (body: CreateConsultationReq) =>
    api.post<ApiResponse<ConsultationRequest>>('/consultations', body).then((r) => r.data.data!),

  // Admin Only
  getConsultations: (params?: { search?: string; status?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<ConsultationRequest>>>('/consultations', { params })
      .then((r) => r.data.data!),

  getNewCount: () =>
    api.get<ApiResponse<number>>('/consultations/new-count').then((r) => r.data.data!),

  updateConsultation: (id: string, body: UpdateConsultationStatusReq) =>
    api.put<ApiResponse<ConsultationRequest>>(`/consultations/${id}`, body).then((r) => r.data.data!),

  deleteConsultation: (id: string) =>
    api.delete<ApiResponse<null>>(`/consultations/${id}`).then((r) => r.data),
}

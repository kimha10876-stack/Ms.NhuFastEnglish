export type ConsultationStatus = 'new' | 'contacted' | 'enrolled' | 'rejected'

export interface ConsultationRequest {
  id: string
  fullName: string
  phone: string
  email?: string
  message?: string
  status: ConsultationStatus
  adminNote?: string
  requestCount: number
  createdAt: string
  contactedAt?: string
}

export interface CreateConsultationReq {
  fullName: string
  phone: string
  email?: string
  message?: string
}

export interface UpdateConsultationStatusReq {
  status: ConsultationStatus
  adminNote?: string
}

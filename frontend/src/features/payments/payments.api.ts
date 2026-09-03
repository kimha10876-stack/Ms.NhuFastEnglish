import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentDetail,
  PaymentStatus,
  PaginatedList,
  AdminPaymentFilter,
} from './payments.types'

export const paymentsApi = {
  createPayment: (req: CreatePaymentRequest) =>
    api.post<ApiResponse<PaymentResponse>>('/payments/create', req).then((r) => r.data.data!),

  getPaymentDetail: (id: string) =>
    api.get<ApiResponse<PaymentDetail>>(`/payments/${id}`).then((r) => r.data.data!),

  getPaymentStatus: (id: string) =>
    api.get<ApiResponse<PaymentStatus>>(`/payments/${id}/status`).then((r) => r.data.data!),

  getMyPayments: (page = 1, pageSize = 10) =>
    api
      .get<ApiResponse<PaginatedList<PaymentResponse>>>('/payments/my-payments', {
        params: { page, pageSize },
      })
      .then((r) => r.data.data!),

  cancelPayment: (id: string) =>
    api.post<ApiResponse<null>>(`/payments/${id}/cancel`).then((r) => r.data.data),

  getAdminPayments: (params?: AdminPaymentFilter) =>
    api
      .get<ApiResponse<PaginatedList<PaymentResponse>>>('/payments/admin/all', { params })
      .then((r) => r.data.data!),

  manualConfirmPayment: (id: string, data: { transactionCode?: string; note?: string }) =>
    api.post<ApiResponse<null>>(`/payments/admin/${id}/confirm-manual`, data).then((r) => r.data.data),
}

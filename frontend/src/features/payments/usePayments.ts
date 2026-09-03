import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from './payments.api'
import type { CreatePaymentRequest, AdminPaymentFilter } from './payments.types'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreatePaymentRequest) => paymentsApi.createPayment(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payments'] })
    },
  })
}

export function usePaymentDetail(id?: string) {
  return useQuery({
    queryKey: ['payment-detail', id],
    queryFn: () => paymentsApi.getPaymentDetail(id!),
    enabled: !!id,
  })
}

export function usePaymentStatus(id?: string, enabled = true) {
  return useQuery({
    queryKey: ['payment-status', id],
    queryFn: () => paymentsApi.getPaymentStatus(id!),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.isCompleted || data?.isFailed) {
        return false
      }
      return 2000 // Tự động kiểm tra mỗi 2 giây khi đang Pending
    },
  })
}

export function useMyPayments(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['my-payments', page, pageSize],
    queryFn: () => paymentsApi.getMyPayments(page, pageSize),
  })
}

export function useCancelPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.cancelPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment-detail'] })
      queryClient.invalidateQueries({ queryKey: ['payment-status'] })
    },
  })
}

export function useAdminPayments(params?: AdminPaymentFilter) {
  return useQuery({
    queryKey: ['admin-payments', params],
    queryFn: () => paymentsApi.getAdminPayments(params),
  })
}

export function useManualConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; transactionCode?: string; note?: string }) =>
      paymentsApi.manualConfirmPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment-detail'] })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationApi } from './consultation.api'
import type { CreateConsultationReq, UpdateConsultationStatusReq } from './consultation.types'

export const CONSULTATIONS_KEY = ['consultations'] as const
export const CONSULTATIONS_COUNT_KEY = ['consultations-new-count'] as const

// Public: Submit consultation request
export function useCreateConsultation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateConsultationReq) => consultationApi.createConsultation(body),
    onSuccess: () => {
      // Invalidate queries so that if an admin is logged in, they see the new request instantly
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_COUNT_KEY })
    },
  })
}

// Admin: Get list of consultations
export function useAdminConsultations(params?: { search?: string; status?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...CONSULTATIONS_KEY, params],
    queryFn: () => consultationApi.getConsultations(params),
  })
}

// Admin: Get new count for sidebar badge
export function useNewConsultationsCount(enabled: boolean = true) {
  return useQuery({
    queryKey: CONSULTATIONS_COUNT_KEY,
    queryFn: () => consultationApi.getNewCount(),
    enabled,
    refetchInterval: 60 * 1000, // Refetch every 1 minute
  })
}

// Admin: Update status and notes
export function useUpdateConsultation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateConsultationStatusReq }) =>
      consultationApi.updateConsultation(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_COUNT_KEY })
    },
  })
}

// Admin: Delete consultation request
export function useDeleteConsultation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => consultationApi.deleteConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_COUNT_KEY })
    },
  })
}

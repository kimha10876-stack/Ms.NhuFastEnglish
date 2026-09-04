import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teachersApi } from './teachers.api'
import type { CreateTeacherRequest, UpdateTeacherRequest } from './teachers.types'

export const TEACHERS_KEY = ['teachers'] as const

export function useTeachers(params?: { search?: string; type?: string; isActive?: boolean; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...TEACHERS_KEY, params],
    queryFn: () => teachersApi.getAll(params),
  })
}

export function useTeacherDetail(id: string) {
  return useQuery({
    queryKey: [...TEACHERS_KEY, 'detail', id],
    queryFn: () => teachersApi.getDetail(id),
    enabled: !!id,
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTeacherRequest) => teachersApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEACHERS_KEY }),
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTeacherRequest }) => teachersApi.update(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TEACHERS_KEY })
      qc.invalidateQueries({ queryKey: [...TEACHERS_KEY, 'detail', variables.id] })
    },
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teachersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEACHERS_KEY }),
  })
}

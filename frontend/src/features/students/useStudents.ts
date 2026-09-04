import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from './students.api'
import type { CreateStudentRequest, UpdateStudentRequest } from './students.types'

export const STUDENTS_KEY = ['students'] as const

export function useStudents(params?: { search?: string; status?: string; level?: string; goal?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, params],
    queryFn: () => studentsApi.getAll(params),
  })
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, 'detail', id],
    queryFn: () => studentsApi.getDetail(id),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStudentRequest) => studentsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENTS_KEY }),
  })
}

export function useUpdateStudent(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateStudentRequest) => studentsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY })
      qc.invalidateQueries({ queryKey: [...STUDENTS_KEY, 'detail', id] })
    },
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENTS_KEY }),
  })
}

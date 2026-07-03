import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classesApi } from './classes.api'
import type { CreateClassRequest, UpdateClassRequest } from './classes.types'

export const CLASSES_KEY = ['classes'] as const

export function useClasses() {
  return useQuery({
    queryKey: CLASSES_KEY,
    queryFn: () => classesApi.getAll(),
  })
}

export function useClassDetail(id: string) {
  return useQuery({
    queryKey: [...CLASSES_KEY, id],
    queryFn: () => classesApi.getDetail(id),
    enabled: !!id,
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClassRequest) => classesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useUpdateClass(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateClassRequest) => classesApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLASSES_KEY })
      qc.invalidateQueries({ queryKey: [...CLASSES_KEY, id] })
    },
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useAddMember(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) => classesApi.addMember(classId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CLASSES_KEY, classId] }),
  })
}

export function useRemoveMember(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => classesApi.removeMember(classId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CLASSES_KEY, classId] }),
  })
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: ({ classId, expiryDays }: { classId: string; expiryDays: number }) =>
      classesApi.createInvite(classId, expiryDays),
  })
}

export function useInviteInfo(token: string) {
  return useQuery({
    queryKey: ['invite', token],
    queryFn: () => classesApi.getInviteInfo(token),
    enabled: !!token,
    retry: false,
  })
}

export function useJoinByInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => classesApi.joinByInvite(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  })
}

export function useSearchStudents(q: string) {
  return useQuery({
    queryKey: ['students-search', q],
    queryFn: () => classesApi.searchStudents(q),
    enabled: q.trim().length >= 2,
    staleTime: 5_000,
  })
}

export function useSearchTeachers(q: string = '') {
  return useQuery({
    queryKey: ['teachers-search', q],
    queryFn: () => classesApi.searchTeachers(q),
    staleTime: 15_000,
  })
}

export function useClassCategories() {
  return useQuery({
    queryKey: ['class-categories'],
    queryFn: () => classesApi.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

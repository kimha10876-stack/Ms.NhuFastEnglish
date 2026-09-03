import { useQuery } from '@tanstack/react-query'
import { usersApi } from './users.api'
import type { UserFilterParams } from './users.types'

export function useUsers(params?: UserFilterParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => usersApi.getUsers(params),
  })
}

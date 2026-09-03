import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { UserFilterParams, PaginatedUsersResponse } from './users.types'

export const usersApi = {
  getUsers: (params?: UserFilterParams) =>
    api
      .get<ApiResponse<PaginatedUsersResponse>>('/users', { params })
      .then((r) => r.data.data!),
}

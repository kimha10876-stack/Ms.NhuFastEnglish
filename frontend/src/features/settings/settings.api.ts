import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'

export interface SystemSetting {
  key: string
  value: string
  description: string | null
}

export interface SaveSettingsRequest {
  settings: Record<string, string>
}

export interface UserWithRoles {
  id: string
  fullName: string
  email: string
  isActive: boolean
  roles: string[]
}

export interface UpdateUserRolesRequest {
  roles: string[]
}

export const settingsApi = {
  getSettings: () =>
    api.get<ApiResponse<SystemSetting[]>>('/settings').then((r) => r.data.data!),

  saveSettings: (body: SaveSettingsRequest) =>
    api.put<ApiResponse<null>>('/settings', body).then((r) => r.data),

  getUsers: () =>
    api.get<ApiResponse<UserWithRoles[]>>('/settings/users').then((r) => r.data.data!),

  updateUserRoles: (userId: string, body: UpdateUserRolesRequest) =>
    api.put<ApiResponse<null>>(`/settings/users/${userId}/roles`, body).then((r) => r.data),
}

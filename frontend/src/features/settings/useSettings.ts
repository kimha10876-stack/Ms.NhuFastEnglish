import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from './settings.api'
import type { SaveSettingsRequest, UpdateUserRolesRequest } from './settings.api'

export const SETTINGS_KEY = ['settings'] as const
export const USERS_KEY = ['settings', 'users'] as const

export function useSystemSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => settingsApi.getSettings(),
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SaveSettingsRequest) => settingsApi.saveSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  })
}

export function useSettingsUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => settingsApi.getUsers(),
  })
}

export function useUpdateUserRoles(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateUserRolesRequest) => settingsApi.updateUserRoles(userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

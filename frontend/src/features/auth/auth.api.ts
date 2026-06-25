import { api } from '@/shared/api/client'
import type { LoginRequest, AuthResponse } from './auth.types'

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (allDevices = false) =>
    api.post('/auth/logout', { allDevices }),
}

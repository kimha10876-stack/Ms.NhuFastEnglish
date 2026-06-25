export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  roles: string[]
}

export type ViewMode = 'admin' | 'teacher'

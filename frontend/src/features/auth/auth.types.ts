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

export interface RegisterStudentRequest {
  fullName: string
  email: string
  password: string
  phone?: string
  parentPhone?: string
  level?: string
  goal?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}

export type ViewMode = 'admin' | 'teacher'

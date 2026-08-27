import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { LoginRequest, AuthResponse, RegisterStudentRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest, UpdateProfileReq, AuthUser } from './auth.types'

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', body).then((r) => r.data.data!),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }).then((r) => r.data.data!),

  logout: (allDevices = false) =>
    api.post('/auth/logout', { allDevices }),

  registerStudent: (body: RegisterStudentRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register/student', body).then((r) => r.data.data!),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', body).then((r) => r.data),

  verifyOtp: (body: VerifyOtpRequest) =>
    api.post<ApiResponse<null>>('/auth/verify-otp', body).then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/reset-password', body).then((r) => r.data),

  changePassword: (body: any) =>
    api.post<ApiResponse<null>>('/auth/change-password', body).then((r) => r.data),

  getProfile: () =>
    api.get<ApiResponse<AuthUser>>('/auth/profile').then((r) => r.data.data!),

  updateProfile: (body: UpdateProfileReq) =>
    api.put<ApiResponse<AuthUser>>('/auth/profile', body).then((r) => r.data.data!),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<AuthUser>>('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((r) => r.data.data!)
  },
}

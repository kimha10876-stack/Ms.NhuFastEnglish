import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './auth.api'
import { useAuthStore } from './auth.store'
import type { LoginRequest, RegisterStudentRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest, UpdateProfileReq } from './auth.types'

export function useLogin(redirectTo?: string) {
  const setUser  = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const startTime = Date.now();
      try {
        const res = await authApi.login(body);
        const elapsedTime = Date.now() - startTime;
        const delay = 1200 - elapsedTime;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        return res;
      } catch (err) {
        const elapsedTime = Date.now() - startTime;
        const delay = 1200 - elapsedTime;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      setUser(data.user)
      navigate(redirectTo ?? '/dashboard')
    },
  })
}

export function useRegisterStudent(inviteToken?: string) {
  const setUser  = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegisterStudentRequest) => authApi.registerStudent(body),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      setUser(data.user)
      if (inviteToken) {
        navigate(`/tham-gia/${inviteToken}`)
      } else {
        navigate('/dashboard')
      }
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (body: VerifyOtpRequest) => authApi.verifyOtp(body),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body),
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return () => {
    authApi.logout().finally(() => {
      logout()
      navigate('/login')
    })
  }
}

export function useChangePassword() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (body: any) => authApi.changePassword(body),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (body: UpdateProfileReq) => authApi.updateProfile(body),
    onSuccess: (data) => {
      setUser(data)
    },
  })
}

export function useUploadAvatar() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      setUser(data)
    },
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 5 * 60 * 1000,
  })
}

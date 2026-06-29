import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './auth.api'
import { useAuthStore } from './auth.store'
import type { LoginRequest, RegisterStudentRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest } from './auth.types'

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      setUser(data.user)
      navigate('/dashboard')
    },
  })
}

export function useRegisterStudent() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegisterStudentRequest) => authApi.registerStudent(body),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      setUser(data.user)
      navigate('/dashboard')
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

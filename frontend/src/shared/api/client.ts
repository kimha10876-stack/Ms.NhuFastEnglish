import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from './types'
import { useAuthStore } from '@/features/auth/auth.store'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Let the browser set multipart boundary — manual Content-Type breaks file uploads
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  return config
})

// On 401 → try refresh, retry once, else logout
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        '/api/auth/refresh',
        { refreshToken }
      )
      const tokens = res.data.data!
      localStorage.setItem('access_token', tokens.accessToken)
      localStorage.setItem('refresh_token', tokens.refreshToken)
      queue.forEach((cb) => cb(tokens.accessToken))
      queue = []
      original.headers.Authorization = `Bearer ${tokens.accessToken}`
      return api(original)
    } catch {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

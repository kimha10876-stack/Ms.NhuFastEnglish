import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, ViewMode } from './auth.types'

interface AuthState {
  user: AuthUser | null
  viewMode: ViewMode
  setUser: (user: AuthUser | null) => void
  setViewMode: (mode: ViewMode) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      viewMode: 'admin',
      setUser: (user) => set({ user }),
      setViewMode: (viewMode) => set({ viewMode }),
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, viewMode: 'admin' })
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, viewMode: s.viewMode }) }
  )
)

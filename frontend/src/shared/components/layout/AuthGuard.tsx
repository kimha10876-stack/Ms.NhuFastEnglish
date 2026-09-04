import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'

export function AuthGuard() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

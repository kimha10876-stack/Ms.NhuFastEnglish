import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'

interface RoleGuardProps {
  allowedRoles: string[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasRequiredRole = user.roles.some((role) => allowedRoles.includes(role))

  if (!hasRequiredRole) {
    // If not authorized for this specific section, redirect safely to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

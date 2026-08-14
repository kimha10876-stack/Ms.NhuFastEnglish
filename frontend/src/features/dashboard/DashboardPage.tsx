import { useAuthStore } from '@/features/auth/auth.store'
import { AdminDashboardView } from './components/AdminDashboardView'
import { TeacherDashboardView } from './components/TeacherDashboardView'
import { StudentDashboardView } from './components/StudentDashboardView'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  // 1. Teacher Role gets dedicated teaching dashboard
  if (isTeacher) {
    return <TeacherDashboardView />
  }

  // 2. Student & Admin Roles see StudentDashboardView
  return <StudentDashboardView />
}

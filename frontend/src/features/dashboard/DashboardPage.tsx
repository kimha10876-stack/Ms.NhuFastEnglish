import { useAuthStore } from '@/features/auth/auth.store'
import { AdminDashboardView } from './components/AdminDashboardView'
import { TeacherDashboardView } from './components/TeacherDashboardView'
import { StudentDashboardView } from './components/StudentDashboardView'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  // 1. Admin Role has top priority for managerial dashboard
  if (isAdmin) {
    return <AdminDashboardView />
  }

  // 2. Teacher Role gets dedicated teaching dashboard
  if (isTeacher) {
    return <TeacherDashboardView />
  }

  // 3. Student Role (or default fallback)
  return <StudentDashboardView />
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/shared/components/layout/AppShell'
import { AuthGuard } from '@/shared/components/layout/AuthGuard'

const LoginPage        = lazy(() => import('@/features/auth/LoginPage'))
const DashboardPage    = lazy(() => import('@/features/dashboard/DashboardPage'))
const StudentsPage     = lazy(() => import('@/features/students/StudentsPage'))
const ClassesPage      = lazy(() => import('@/features/classes/ClassesPage'))
const TeachersPage     = lazy(() => import('@/features/teachers/TeachersPage'))
const ConsultationsPage = lazy(() => import('@/features/consultations/ConsultationsPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"     element={<DashboardPage />} />
                <Route path="students"      element={<StudentsPage />} />
                <Route path="classes"       element={<ClassesPage />} />
                <Route path="teachers"      element={<TeachersPage />} />
                <Route path="consultations" element={<ConsultationsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

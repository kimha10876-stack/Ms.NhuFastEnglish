import { Link } from 'react-router-dom'
import {
  GraduationCap,
  BookOpen,
  Users,
  MessageSquare,
  PlusCircle,
  FileText,
  Settings,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/features/students/students.api'
import { teachersApi } from '@/features/teachers/teachers.api'
import { classesApi } from '@/features/classes/classes.api'
import { consultationApi } from '@/features/consultations/consultation.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Button } from '@/shared/components/ui/button'

export function AdminDashboardView() {
  const user = useAuthStore((s) => s.user)

  // Fetch count stats
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['admin-dashboard-students'],
    queryFn: () => studentsApi.getAll({ pageSize: 1 }),
  })

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['admin-dashboard-classes'],
    queryFn: () => classesApi.getAll({ pageSize: 5 }),
  })

  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ['admin-dashboard-teachers'],
    queryFn: () => teachersApi.getAll({ pageSize: 1 }),
  })

  const { data: consultationsData, isLoading: loadingConsultations } = useQuery({
    queryKey: ['admin-dashboard-consultations'],
    queryFn: () => consultationApi.getConsultations({ pageSize: 5 }),
  })

  const totalStudents = loadingStudents ? '...' : String(studentsData?.totalCount ?? 0)
  const totalClasses = loadingClasses ? '...' : String(classesData?.totalCount ?? 0)
  const totalTeachers = loadingTeachers ? '...' : String(teachersData?.totalCount ?? 0)
  const totalConsultations = loadingConsultations ? '...' : String(consultationsData?.totalCount ?? 0)

  const stats = [
    {
      label: 'Tổng số học viên',
      value: totalStudents,
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 text-blue-600',
      to: '/students',
    },
    {
      label: 'Lớp học đang mở',
      value: totalClasses,
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 text-amber-600',
      to: '/classes',
    },
    {
      label: 'Đội ngũ giáo viên',
      value: totalTeachers,
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50 text-purple-600',
      to: '/teachers',
    },
    {
      label: 'Yêu cầu tư vấn',
      value: totalConsultations,
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 text-emerald-600',
      to: '/consultations',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-sm border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Quản trị hệ thống</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Xin chào, {user?.fullName || 'Quản trị viên'}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Hệ thống đang vận hành ổn định. Dưới đây là bức tranh tổng quan hoạt động của Ms Nhu Fast English.
          </p>
        </div>

        {/* Quick action buttons on banner */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          <Link to="/classes">
            <Button className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-amber-500/20">
              <PlusCircle className="h-4 w-4" />
              Tạo lớp mới
            </Button>
          </Link>
          <Link to="/students">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm border border-white/10">
              Thêm học viên
            </Button>
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, to }) => (
          <Link
            key={label}
            to={to}
            className="group bg-white rounded-2xl p-5 border border-gray-150 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} group-hover:scale-105 transition-transform`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full bg-amber-500" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Lớp học gần đây
              </h2>
            </div>
            <Link
              to="/classes"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
            {loadingClasses ? (
              <div className="p-8 text-center text-xs text-gray-400">Đang tải dữ liệu lớp học...</div>
            ) : !classesData?.items || classesData.items.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">Chưa có lớp học nào được tạo.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {classesData.items.map((cls) => (
                  <Link
                    key={cls.id}
                    to={`/classes/${cls.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: cls.categoryColorHex || '#F59E0B' }}
                      >
                        {cls.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                          {cls.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          GV: {cls.teacherName || 'Chưa gán'} • {cls.categoryName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-gray-600">
                          {cls.memberCount ?? 0} học viên
                        </span>
                        <p className="text-[11px] text-gray-400">{cls.scheduleDays || 'Lịch linh hoạt'}</p>
                      </div>
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                        {cls.status === 'active' ? 'Đang mở' : cls.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Consultations & Quick Tools */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              Lối tắt quản trị
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/students"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-gray-700 transition-colors"
              >
                <GraduationCap className="h-4 w-4 text-amber-500" />
                Học viên
              </Link>
              <Link
                to="/teachers"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-gray-700 transition-colors"
              >
                <Users className="h-4 w-4 text-purple-500" />
                Giáo viên
              </Link>
              <Link
                to="/blog-management"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                Viết Blog
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                Cấu hình
              </Link>
            </div>
          </div>

          {/* Recent Consultations Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Tư vấn mới
              </h3>
              <Link to="/consultations" className="text-xs text-amber-600 font-bold hover:underline">
                Xem hết
              </Link>
            </div>

            {loadingConsultations ? (
              <p className="text-xs text-gray-400">Đang tải...</p>
            ) : !consultationsData?.items || consultationsData.items.length === 0 ? (
              <p className="text-xs text-gray-400">Không có yêu cầu tư vấn mới.</p>
            ) : (
              <div className="space-y-2.5">
                {consultationsData.items.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to="/consultations"
                    className="block p-2.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{c.fullName}</p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                          c.status === 'new'
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.status === 'new' ? 'Mới' : c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {c.phone}
                      </span>
                      {c.message && <span className="truncate">• {c.message}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

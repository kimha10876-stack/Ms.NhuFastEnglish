import {
  GraduationCap,
  BookOpen,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'

const stats = [
  { label: 'Học viên', value: '—', icon: GraduationCap, bg: 'bg-blue-50',   icon_color: 'text-blue-500',   border: 'border-blue-100' },
  { label: 'Lớp đang mở', value: '—', icon: BookOpen,   bg: 'bg-amber-50',  icon_color: 'text-amber-500',  border: 'border-amber-100' },
  { label: 'Học phí chưa đóng', value: '—', icon: CreditCard, bg: 'bg-red-50', icon_color: 'text-red-500', border: 'border-red-100' },
  { label: 'Giáo viên', value: '—', icon: Users,         bg: 'bg-purple-50', icon_color: 'text-purple-500', border: 'border-purple-100' },
]

interface MyClass {
  classId: string
  className: string
  categoryName: string
  categoryColorHex: string
  teacherName: string
  status: string
  joinedAt: string
  scheduleDays: string
  scheduleTime: string
  room: string
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isStudent = user?.roles.includes('Student') ?? false

  // Fetch Student profile details (to get Level, Goal, etc.)
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => api.get<ApiResponse<any>>(`/students/${user?.id}`).then((r) => r.data.data!),
    enabled: isStudent && !!user?.id,
    retry: false, // Bypass role error if not fully registered yet
  })

  // Fetch Student classes
  const { data: myClasses = [], isLoading: loadingMyClasses } = useQuery<MyClass[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<MyClass[]>>('/classes/my-classes').then((r) => r.data.data!),
    enabled: isStudent,
  })

  if (isStudent) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-6 md:p-8 text-gray-900 shadow-md">
          <div className="relative z-10 space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Student Portal
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Chào mừng {user?.fullName} trở lại!
            </h1>
            <p className="text-xs md:text-sm text-gray-900/80 leading-relaxed">
              Chúc bạn có một buổi học tập tràn đầy năng lượng và hiệu quả tại Ms. Nhụ Fast English!
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 translate-x-10 pointer-events-none" />
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Trình độ mục tiêu</p>
              <p className="font-bold text-gray-800 text-base mt-0.5">
                {studentProfile?.level || 'Đang cập nhật'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Mục tiêu học tập</p>
              <p className="font-bold text-gray-800 text-base mt-0.5">
                {studentProfile?.goal || 'Đang cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* My Classes Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-amber-500" />
                Lớp học của tôi ({myClasses.length})
              </h2>
            </div>

            {loadingMyClasses ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 flex justify-center shadow-sm">
                <p className="text-xs text-gray-400">Đang tải danh sách lớp học...</p>
              </div>
            ) : myClasses.length === 0 ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-sm text-gray-700">Bạn chưa tham gia lớp học nào</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Liên hệ trung tâm hoặc dùng link mời để tham gia lớp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myClasses.map((cls) => (
                  <Link
                    key={cls.classId}
                    to={`/classes/${cls.classId}`}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: cls.categoryColorHex || '#6B7280' }}
                      >
                        {cls.categoryName}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold px-2 py-0.5 rounded-md">
                        Đang học
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-sm line-clamp-1">
                        {cls.className}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <UserIcon className="h-3 w-3 shrink-0" />
                        GV: {cls.teacherName}
                      </p>
                    </div>

                    <div className="border-t border-gray-50 pt-3 mt-auto space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        Lịch học: {cls.scheduleDays || 'Chưa cập nhật'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        Giờ học: {cls.scheduleTime || 'Chưa cập nhật'}
                      </div>
                      {cls.room && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          Phòng: {cls.room}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & Notifications Column */}
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
              Thông tin hỗ trợ
            </h2>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-700">Liên hệ trung tâm</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Hotline: <strong className="text-gray-800">0905 123 456</strong></p>
                  <p>Địa chỉ: <strong className="text-gray-800">123 Ba Tháng Hai, Hải Châu, Đà Nẵng</strong></p>
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-700">Liên kết nhanh</p>
                <Link
                  to="/blog"
                  className="flex items-center justify-between text-xs text-amber-600 hover:text-amber-700 font-bold group"
                >
                  Xem tin tức & blog chia sẻ
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    )
  }

  // Admin and Teacher Dashboard View
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Chào buổi sáng</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, bg, icon_color, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-2xl p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${icon_color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder charts area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Học viên mới</p>
          </div>
          <div className="h-32 flex items-center justify-center rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Biểu đồ đang phát triển...</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Hoạt động gần đây</p>
          </div>
          <div className="h-32 flex items-center justify-center rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">Đang phát triển...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

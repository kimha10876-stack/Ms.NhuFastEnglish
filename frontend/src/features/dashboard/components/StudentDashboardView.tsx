import { Link } from 'react-router-dom'
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'

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

export function StudentDashboardView() {
  const user = useAuthStore((s) => s.user)

  // Fetch Student profile details (Level, Goal, etc.)
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => api.get<ApiResponse<any>>(`/students/${user?.id}`).then((r) => r.data.data!),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: myClassesData = [], isLoading: loadingMyClasses } = useQuery<MyClass[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<MyClass[]>>('/classes/my-classes').then((r) => r.data.data!),
  })

  const myClasses = myClassesData.filter((cls) => cls.status === 'active')

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 p-6 sm:p-8 text-gray-950 shadow-lg">
        <div className="relative z-10 space-y-2 max-w-lg">
          <span className="inline-flex items-center gap-1.5 bg-black/10 text-gray-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Cổng Học viên
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-950">
            Chào mừng {user?.fullName || 'bạn'} trở lại!
          </h1>
          <p className="text-xs sm:text-sm text-gray-900/85 leading-relaxed font-medium">
            Chúc bạn có một buổi học tràn đầy năng lượng và hiệu quả tại Ms Nhu Fast English!
          </p>
        </div>
        {/* Decorative element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/10 skew-x-12 translate-x-10 pointer-events-none" />
      </div>

      {/* ── Target Level & Goal Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trình độ mục tiêu</p>
            <p className="font-extrabold text-gray-800 text-base sm:text-lg mt-0.5">
              {studentProfile?.level || 'Đang cập nhật'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mục tiêu học tập</p>
            <p className="font-extrabold text-gray-800 text-base sm:text-lg mt-0.5">
              {studentProfile?.goal || 'Đang cập nhật'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Classes Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full bg-amber-500" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Lớp học của tôi ({myClasses.length})
              </h2>
            </div>
          </div>

          {loadingMyClasses ? (
            <div className="bg-white border border-gray-150 rounded-2xl p-10 flex justify-center shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Đang tải danh sách lớp học...</p>
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
                  className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: cls.categoryColorHex || '#6B7280' }}
                    >
                      {cls.categoryName}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-md">
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

                  <div className="border-t border-gray-100 pt-3 mt-auto space-y-1.5 text-xs text-gray-500">
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

        {/* Quick Info & Support Column */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
            Thông tin hỗ trợ
          </h2>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-500" />
                Liên hệ trung tâm
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Hotline: <strong className="text-gray-900 font-bold">0905 123 456</strong></p>
                <p>Địa chỉ: <span className="text-gray-800">123 Ba Tháng Hai, Hải Châu, Đà Nẵng</span></p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                Liên kết nhanh
              </p>
              <Link
                to="/blog"
                className="flex items-center justify-between text-xs text-amber-600 hover:text-amber-700 font-bold group p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors"
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

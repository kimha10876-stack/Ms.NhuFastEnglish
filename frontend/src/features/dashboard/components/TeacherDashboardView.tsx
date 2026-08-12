import { Link } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { classesApi } from '@/features/classes/classes.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { Button } from '@/shared/components/ui/button'

export function TeacherDashboardView() {
  const user = useAuthStore((s) => s.user)

  // Backend automatically filters classes where current user is teacher
  const { data: myClassesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['teacher-dashboard-classes'],
    queryFn: () => classesApi.getAll({ pageSize: 20 }),
  })

  const classes = myClassesData?.items ?? []
  const activeClasses = classes.filter((c) => c.status === 'active')
  const totalStudents = classes.reduce((sum, c) => sum + (c.memberCount || 0), 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-blue-100 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Không gian Giảng viên (Teacher Portal)
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Chào mừng Thầy/Cô {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Chúc Thầy/Cô một ngày giảng dạy tràn đầy cảm hứng và hiệu quả tại Ms Nhu Fast English!
          </p>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          <Link to="/classes">
            <Button className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg shadow-black/10">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Xem danh sách lớp học
            </Button>
          </Link>
          <Link to="/blog-management/editor">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm border border-white/10">
              <FileText className="h-4 w-4 mr-1.5" />
              Soạn bài chia sẻ
            </Button>
          </Link>
        </div>

        {/* Decorative element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 translate-x-10 pointer-events-none" />
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lớp đang phụ trách</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {loadingClasses ? '...' : activeClasses.length} <span className="text-xs font-normal text-gray-500">lớp</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tổng số học viên</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {loadingClasses ? '...' : totalStudents} <span className="text-xs font-normal text-gray-500">học viên</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Trạng thái giảng dạy</p>
            <p className="text-sm font-bold text-emerald-700 mt-1">
              Đang hoạt động tích cực
            </p>
          </div>
        </div>
      </div>

      {/* ── My Classes Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 rounded-full bg-amber-500" />
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
              Lớp học của tôi ({activeClasses.length})
            </h2>
          </div>
          <Link
            to="/classes"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            Quản lý tất cả lớp
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loadingClasses ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center text-xs text-gray-400 shadow-sm">
            Đang tải thông tin lớp học...
          </div>
        ) : activeClasses.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-sm text-gray-700">Chưa có lớp học nào được phân công</p>
            <p className="text-xs text-gray-400 mt-1">
              Khi quản trị viên phân công lớp học cho Thầy/Cô, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white tracking-wide"
                      style={{ backgroundColor: cls.categoryColorHex || '#4F46E5' }}
                    >
                      {cls.categoryName}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-md">
                      {cls.memberCount ?? 0} Học viên
                    </span>
                  </div>

                  <Link to={`/classes/${cls.id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-amber-600 transition-colors text-base line-clamp-1">
                      {cls.name}
                    </h3>
                  </Link>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{cls.scheduleDays || 'Lịch học linh hoạt'}</span>
                    </div>
                    {cls.scheduleTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{cls.scheduleTime}</span>
                      </div>
                    )}
                    {cls.room && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>Phòng: {cls.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick actions for teacher */}
                <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between gap-2">
                  <Link
                    to={`/classes/${cls.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-gray-700 transition-colors"
                  >
                    Vào lớp học
                  </Link>
                  <Link
                    to={`/classes/${cls.id}`}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors"
                    title="Chi tiết & Điểm danh"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

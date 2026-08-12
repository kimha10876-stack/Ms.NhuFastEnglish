import { useState } from 'react'
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
  FileCheck,
  AlertCircle,
  CreditCard,
  History,
  QrCode,
  Copy,
  Check,
  Loader2,
  Award,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import { classesApi } from '@/features/classes/classes.api'
import type { StudentAssignmentItem, StudentMonthlyTuitionSummary } from '@/features/classes/classes.types'
import { Button } from '@/shared/components/ui/button'

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
  const queryClient = useQueryClient()

  // State
  const [assignmentTab, setAssignmentTab] = useState<'pending' | 'completed'>('pending')
  const [selectedPayTuition, setSelectedPayTuition] = useState<StudentMonthlyTuitionSummary | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 1. Fetch Student profile details (Level, Goal, etc.)
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => api.get<ApiResponse<any>>(`/students/${user?.id}`).then((r) => r.data.data!),
    enabled: !!user?.id,
    retry: false,
  })

  // 2. Fetch My Classes
  const { data: myClassesData = [], isLoading: loadingMyClasses } = useQuery<MyClass[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<MyClass[]>>('/classes/my-classes').then((r) => r.data.data!),
  })

  // 3. Fetch My Assignments
  const { data: myAssignments = [], isLoading: loadingAssignments } = useQuery<StudentAssignmentItem[]>({
    queryKey: ['my-assignments'],
    queryFn: () => classesApi.getMyAssignments(),
  })

  // 4. Fetch My Tuitions
  const { data: myTuitions = [] } = useQuery<StudentMonthlyTuitionSummary[]>({
    queryKey: ['my-tuitions'],
    queryFn: () => classesApi.getMyTuitions(),
  })

  // Mutation pay tuition
  const payTuitionMutation = useMutation({
    mutationFn: ({ classId, month, year, amount, note }: { classId: string; month: number; year: number; amount: number; note?: string }) =>
      classesApi.payTuition(classId, {
        month,
        year,
        amount,
        paymentMethod: 'VietQR',
        note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tuitions'] })
      queryClient.invalidateQueries({ queryKey: ['my-classes'] })
      setSelectedPayTuition(null)
    },
  })

  const myClasses = myClassesData.filter((cls) => cls.status === 'active')

  // Filter assignments
  const pendingAssignments = myAssignments.filter((a) => !a.isSubmitted)
  const completedAssignments = myAssignments.filter((a) => a.isSubmitted)

  // Unpaid tuition list for current month
  const unpaidTuitions = myTuitions.filter((t) => t.monthlyFee > 0 && !t.isCurrentMonthPaid)

  // All payment history aggregated
  const allPaymentHistory = myTuitions.flatMap((t) => t.history || [])
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa có hạn'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

      {/* ── UNPAID TUITION ALERT BANNER (ONLY SHOW WHEN UNPAID) ── */}
      {unpaidTuitions.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>Học phí cần thanh toán</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-extrabold">
                    Tháng {unpaidTuitions[0].currentMonth}/{unpaidTuitions[0].currentYear}
                  </span>
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Bạn có <strong className="text-red-700">{unpaidTuitions.length} lớp học</strong> chưa hoàn tất học phí tháng này. Vui lòng đóng học phí để duy trì quyền lợi học tập.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setSelectedPayTuition(unpaidTuitions[0])}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 shrink-0 gap-1.5"
            >
              <QrCode className="h-4 w-4" />
              Đóng học phí ngay
            </Button>
          </div>

          {/* Quick list of unpaid classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-red-100">
            {unpaidTuitions.map((t) => (
              <div
                key={t.classId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-red-100 text-xs"
              >
                <span className="font-bold text-gray-900 truncate">{t.className}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-extrabold text-red-600">{formatCurrency(t.monthlyFee)}</span>
                  <button
                    onClick={() => setSelectedPayTuition(t)}
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* ── WIDGET: BÀI TẬP VỀ NHÀ CẦN LÀM ── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <span>Bài tập về nhà cần làm</span>
                {pendingAssignments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-black animate-pulse">
                    {pendingAssignments.length} bài cần nộp
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Danh sách bài tập và bài kiểm tra được giao từ các lớp học</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setAssignmentTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                assignmentTab === 'pending'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Cần làm</span>
              {pendingAssignments.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold leading-tight">
                  {pendingAssignments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAssignmentTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                assignmentTab === 'completed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Đã hoàn thành</span>
              <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 text-[10px] font-extrabold leading-tight">
                {completedAssignments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Assignment List Content */}
        {loadingAssignments ? (
          <div className="p-8 text-center text-xs text-gray-400">Đang tải danh sách bài tập...</div>
        ) : myAssignments.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <BookOpen className="h-10 w-10 text-amber-500/70 mx-auto" />
            <p className="font-bold text-sm text-gray-800">Hiện tại chưa có bài tập về nhà nào được giao</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Khi giáo viên tạo bài tập hoặc bài kiểm tra trong lớp học của bạn, danh sách bài tập cần làm sẽ xuất hiện ngay tại đây.
            </p>
          </div>
        ) : assignmentTab === 'pending' ? (
          pendingAssignments.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-gray-800">Tuyệt vời! Bạn đã hoàn thành tất cả bài tập.</p>
              <p className="text-xs text-gray-400">Không có bài tập nào đang chờ nộp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignments.map((a) => (
                <div
                  key={a.assignmentId}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    a.isOverdue
                      ? 'bg-red-50/30 border-red-200 hover:border-red-300'
                      : 'bg-white border-gray-150 hover:border-amber-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white truncate max-w-[150px]"
                        style={{ backgroundColor: a.categoryColorHex || '#4F46E5' }}
                      >
                        {a.className}
                      </span>
                      {a.isOverdue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1 shrink-0">
                          <AlertCircle className="h-3 w-3" />
                          Quá hạn nộp
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                          {a.assignmentType === 'Quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{a.title}</h3>
                    {a.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{a.description}</p>
                    )}

                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>Hạn nộp: <strong className={a.isOverdue ? 'text-red-600' : 'text-gray-700'}>{formatDate(a.dueDate)}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">GV: {a.teacherName}</span>
                    <Link to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}>
                      <Button size="sm" className="h-8 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 shadow-sm gap-1">
                        Làm bài ngay
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          completedAssignments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Bạn chưa nộp bài tập nào.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAssignments.map((a) => (
                <div
                  key={a.assignmentId}
                  className="rounded-2xl p-4 border border-gray-150 bg-gray-50/50 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 truncate">
                        {a.className}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã nộp bài
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{a.title}</h3>

                    {a.grade !== null && a.grade !== undefined ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-xs">
                        <Award className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-amber-900">Điểm số: {a.grade}/10</span>
                        {a.teacherFeedback && (
                          <span className="text-gray-600 truncate">• {a.teacherFeedback}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Đang chờ giáo viên chấm điểm</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Nộp lúc: {formatDate(a.submittedAt)}</span>
                    <Link to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}>
                      <button className="text-xs font-bold text-amber-700 hover:underline">
                        Xem lại bài
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
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
            <Link to="/classes" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group">
              Tất cả lớp
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
            Tiện ích & Hỗ trợ
          </h2>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Payment History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100 text-xs font-bold text-gray-700 hover:text-amber-900 transition-all group"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500 group-hover:rotate-[-20deg] transition-transform" />
                <span>Lịch sử đóng học phí</span>
              </div>
              <span className="text-[11px] text-gray-400 group-hover:text-amber-600 font-semibold">
                {allPaymentHistory.length} lần
              </span>
            </button>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-500" />
                Liên hệ trung tâm
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Hotline: <strong className="text-gray-900 font-bold">0905 123 456</strong></p>
                <p>Địa chỉ: <span className="text-gray-800">123 Ba Tháng Hai, Hải Châu, Đà Nẵng</span></p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                Góc học tập
              </p>
              <Link
                to="/blog"
                className="flex items-center justify-between text-xs text-amber-600 hover:text-amber-700 font-bold group p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors"
              >
                Tin tức & Mẹo học tiếng Anh
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL THANH TOÁN HỌC PHÍ VIETQR ── */}
      {selectedPayTuition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-gray-900 text-base">Đóng học phí qua VietQR</h2>
                <p className="text-xs text-gray-400 mt-0.5">Lớp: {selectedPayTuition.className}</p>
              </div>
              <button
                onClick={() => setSelectedPayTuition(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Amount Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Học phí Tháng {selectedPayTuition.currentMonth}/{selectedPayTuition.currentYear}
                </p>
                <p className="text-2xl font-black text-amber-700 tracking-tight">
                  {formatCurrency(selectedPayTuition.monthlyFee)}
                </p>
              </div>

              {/* VietQR Code Image */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-150">
                <img
                  src={`https://img.vietqr.io/image/MB-0905123456-compact2.png?amount=${selectedPayTuition.monthlyFee}&addInfo=${encodeURIComponent(
                    `MSNHU ${user?.fullName} T${selectedPayTuition.currentMonth}`
                  )}&accountName=TRUNG%20TAM%20MS%20NHU`}
                  alt="Mã VietQR"
                  className="w-56 h-auto rounded-xl shadow-md border border-white"
                />
                <p className="text-[11px] text-gray-500 mt-2 text-center font-medium">
                  Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã thanh toán tự động
                </p>
              </div>

              {/* Bank Details with Copy buttons */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Ngân hàng</p>
                    <p className="font-bold text-gray-900">MBBank (Ngân hàng Quân Đội)</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Số tài khoản</p>
                    <p className="font-bold text-gray-900 font-mono text-sm">0905 123 456</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('0905123456', 'stk')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-bold text-[11px] text-gray-700 hover:bg-gray-100"
                  >
                    {copiedField === 'stk' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Chủ tài khoản</p>
                    <p className="font-bold text-gray-900">TRUNG TAM TIENG ANH MS NHU</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Nội dung chuyển khoản</p>
                    <p className="font-bold text-amber-700 font-mono">
                      MSNHU {user?.fullName} T{selectedPayTuition.currentMonth}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`MSNHU ${user?.fullName} T${selectedPayTuition.currentMonth}`, 'nd')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-bold text-[11px] text-gray-700 hover:bg-gray-100"
                  >
                    {copiedField === 'nd' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'nd' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2.5">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => setSelectedPayTuition(null)}
              >
                Đóng
              </Button>
              <Button
                className="flex-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                disabled={payTuitionMutation.isPending}
                onClick={() => {
                  payTuitionMutation.mutate({
                    classId: selectedPayTuition.classId,
                    month: selectedPayTuition.currentMonth,
                    year: selectedPayTuition.currentYear,
                    amount: selectedPayTuition.monthlyFee,
                    note: `Chuyển khoản VietQR tháng ${selectedPayTuition.currentMonth}`,
                  })
                }}
              >
                {payTuitionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Xác nhận đã chuyển khoản
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LỊCH SỬ ĐÓNG HỌC PHÍ ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Lịch sử đóng học phí</h2>
                  <p className="text-xs text-gray-400">Các giao dịch và học phí đã thanh toán</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {allPaymentHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Bạn chưa có lịch sử thanh toán học phí nào.
                </div>
              ) : (
                allPaymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-gray-150 bg-gray-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.className}</p>
                      <p className="text-gray-500">
                        Học phí Tháng {p.month}/{p.year} • Phương thức: <strong>{p.paymentMethod}</strong>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Thanh toán lúc: {formatDate(p.paidAt)}
                      </p>
                      {p.note && <p className="text-[11px] text-gray-600 italic">Ghi chú: {p.note}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-gray-900">{formatCurrency(p.amount)}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status === 'paid' ? 'Đã xác nhận' : p.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <Button
                variant="secondary"
                className="rounded-xl text-xs font-bold px-5"
                onClick={() => setShowHistoryModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

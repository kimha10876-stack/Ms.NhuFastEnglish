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
  Award,
  CheckCircle2,
  X,
  ChevronRight,
  CreditCard,
  Receipt,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import { classesApi } from '@/features/classes/classes.api'
import type { StudentAssignmentItem } from '@/features/classes/classes.types'
import { Button } from '@/shared/components/ui/button'
import { useCreatePayment } from '@/features/payments/usePayments'
import { PaymentCheckoutModal } from '@/features/payments/components/PaymentCheckoutModal'
import { PaymentHistoryModal } from '@/features/payments/components/PaymentHistoryModal'
import type { PaymentResponse } from '@/features/payments/payments.types'

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

  // State
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [assignmentTab, setAssignmentTab] = useState<'pending' | 'completed'>('pending')
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [payingClassId, setPayingClassId] = useState<string | null>(null)

  const createPaymentMutation = useCreatePayment()

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
  const { data: myAssignments = [] } = useQuery<StudentAssignmentItem[]>({
    queryKey: ['my-assignments'],
    queryFn: () => classesApi.getMyAssignments(),
  })

  const myClasses = myClassesData.filter((cls) => cls.status === 'active')

  // Filter assignments
  const pendingAssignments = myAssignments.filter((a) => !a.isSubmitted)
  const completedAssignments = myAssignments.filter((a) => a.isSubmitted)

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-5xl mx-auto">
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

      {/* ── NOTIFICATION COMPACT WIDGET: BÀI TẬP VỀ NHÀ CẦN LÀM ── */}
      {pendingAssignments.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center shrink-0 shadow-sm font-black">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900">
                  Bạn có <span className="text-amber-700 font-extrabold">{pendingAssignments.length} bài tập về nhà</span> cần làm
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                  Chưa nộp
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                Bài gần nhất: <strong className="text-gray-800">{pendingAssignments[0].title}</strong> ({pendingAssignments[0].className})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              onClick={() => {
                setAssignmentTab('pending')
                setShowHomeworkModal(true)
              }}
              className="h-8.5 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 shadow-sm gap-1"
            >
              Xem & làm bài
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Target Level & Goal Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Trình độ mục tiêu</p>
            <p className="font-extrabold text-gray-800 text-base mt-0.5">
              {studentProfile?.level || 'Đang cập nhật'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Mục tiêu học tập</p>
            <p className="font-extrabold text-gray-800 text-base mt-0.5">
              {studentProfile?.goal || 'Đang cập nhật'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPayingClassId(cls.classId)
                      createPaymentMutation.mutate(
                        { classId: cls.classId, paymentType: 'TuitionMonthly', paymentMethod: 'PayOS' },
                        {
                          onSuccess: (res) => {
                            setActivePayment(res)
                            setPayingClassId(null)
                          },
                          onError: () => setPayingClassId(null),
                        }
                      )
                    }}
                    disabled={payingClassId === cls.classId}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50/80 hover:bg-teal-100/90 text-teal-700 text-xs font-semibold border border-teal-200/70 transition-all hover:shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    <span>{payingClassId === cls.classId ? 'Đang tạo mã VietQR...' : 'Đóng học phí (VietQR)'}</span>
                  </button>
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

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3.5">
            {/* Homework Button */}
            <button
              onClick={() => setShowHomeworkModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/70 text-xs font-bold text-gray-800 hover:text-amber-950 transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Bài tập của tôi</span>
              </div>
              {pendingAssignments.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                  {pendingAssignments.length} cần làm
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 font-semibold">
                  {completedAssignments.length} đã xong
                </span>
              )}
            </button>

            {/* Payment History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/70 text-xs font-bold text-gray-800 hover:text-indigo-950 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span>Lịch sử đóng học phí</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
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

      {/* ── MODAL CHI TIẾT BÀI TẬP CỦA TÔI (GỌN GÀNG, KHÔNG LÀM TRÀN DASHBOARD) ── */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Bài tập của tôi</h2>
                  <p className="text-xs text-gray-400">Danh sách bài tập và bài kiểm tra từ các lớp học</p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl mr-2">
                <button
                  onClick={() => setAssignmentTab('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    assignmentTab === 'pending'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Cần làm</span>
                  {pendingAssignments.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                      {pendingAssignments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setAssignmentTab('completed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    assignmentTab === 'completed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Đã hoàn thành</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 text-[10px] font-extrabold">
                    {completedAssignments.length}
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowHomeworkModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {myAssignments.length === 0 ? (
                <div className="p-10 text-center space-y-2.5">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-sm text-gray-800">Hiện tại chưa có bài tập nào được giao</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Khi giáo viên giao bài tập trong lớp học của bạn, bài tập sẽ xuất hiện tại đây.
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
                  pendingAssignments.map((a) => (
                    <div
                      key={a.assignmentId}
                      className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        a.isOverdue
                          ? 'bg-red-50/30 border-red-200'
                          : 'bg-gray-50/60 border-gray-150 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white truncate max-w-[140px]"
                            style={{ backgroundColor: a.categoryColorHex || '#4F46E5' }}
                          >
                            {a.className}
                          </span>
                          {a.isOverdue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Quá hạn nộp
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {a.assignmentType === 'Quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm truncate">{a.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>Hạn nộp: <strong className={a.isOverdue ? 'text-red-600' : 'text-gray-700'}>{formatDate(a.dueDate)}</strong></span>
                          <span className="text-gray-300">•</span>
                          <span>GV: {a.teacherName}</span>
                        </p>
                      </div>

                      <Link
                        to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}
                        onClick={() => setShowHomeworkModal(false)}
                        className="shrink-0"
                      >
                        <Button size="sm" className="h-8.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 shadow-sm gap-1 w-full sm:w-auto">
                          Làm bài ngay
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))
                )
              ) : (
                completedAssignments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">Bạn chưa nộp bài tập nào.</div>
                ) : (
                  completedAssignments.map((a) => (
                    <div
                      key={a.assignmentId}
                      className="rounded-2xl p-4 border border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 truncate">
                            {a.className}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã nộp bài
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm truncate">{a.title}</h3>

                        {a.grade !== null && a.grade !== undefined ? (
                          <div className="flex items-center gap-2 text-xs">
                            <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span className="font-bold text-amber-900">
                              {a.assignmentType === 'Quiz' ? `Đúng ${a.grade} câu` : `Điểm: ${a.grade}/10`}
                            </span>
                            {a.teacherFeedback && (
                              <span className="text-gray-500 truncate">• {a.teacherFeedback}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Đang chờ chấm điểm</p>
                        )}
                      </div>

                      <Link
                        to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}
                        onClick={() => setShowHomeworkModal(false)}
                        className="shrink-0"
                      >
                        <button className="text-xs font-bold text-amber-700 hover:underline">
                          Xem lại bài làm
                        </button>
                      </Link>
                    </div>
                  ))
                )
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <Button
                variant="secondary"
                className="rounded-xl text-xs font-bold px-5"
                onClick={() => setShowHomeworkModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modals */}
      <PaymentCheckoutModal
        payment={activePayment}
        onClose={() => setActivePayment(null)}
        onSuccess={() => setActivePayment(null)}
      />

      {showHistoryModal && (
        <PaymentHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}

    </div>
  )
}

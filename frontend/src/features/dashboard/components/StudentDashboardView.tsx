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
  Award,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth.store'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import { classesApi } from '@/features/classes/classes.api'
import type { StudentAssignmentItem, StudentMonthlyTuitionSummary } from '@/features/classes/classes.types'
import { Button } from '@/shared/components/ui/button'
import { PageLayout, EmptyState, LoadingState, Modal } from '@/shared/components'

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

  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [assignmentTab, setAssignmentTab] = useState<'pending' | 'completed'>('pending')
  const [selectedPayTuition, setSelectedPayTuition] = useState<StudentMonthlyTuitionSummary | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

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

  const { data: myAssignments = [] } = useQuery<StudentAssignmentItem[]>({
    queryKey: ['my-assignments'],
    queryFn: () => classesApi.getMyAssignments(),
  })

  const { data: myTuitions = [] } = useQuery<StudentMonthlyTuitionSummary[]>({
    queryKey: ['my-tuitions'],
    queryFn: () => classesApi.getMyTuitions(),
  })

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
  const pendingAssignments = myAssignments.filter((a) => !a.isSubmitted)
  const completedAssignments = myAssignments.filter((a) => a.isSubmitted)
  const unpaidTuitions = myTuitions.filter((t) => t.monthlyFee > 0 && !t.isCurrentMonthPaid)

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
    <PageLayout>
{/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 p-6 sm:p-8 text-gray-950 shadow-lg">
        <div className="relative z-10 space-y-2 max-w-lg">
          <span className="inline-flex items-center gap-1.5 bg-black/10 text-ink-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Cổng Học viên
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-950">
            Chào mừng {user?.fullName || 'bạn'} trở lại!
          </h1>
          <p className="text-xs sm:text-sm text-ink-900/85 leading-relaxed font-medium">
            Chúc bạn có một buổi học tràn đầy năng lượng và hiệu quả tại Ms Nhu Fast English!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-background/10 skew-x-12 translate-x-10 pointer-events-none" />
      </div>

      {/* Homework notification widget */}
      {pendingAssignments.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500/10 via-orange-500/10 to-primary-500/5 border border-primary-200 rounded p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded bg-primary-500 text-gray-950 flex items-center justify-center shrink-0 shadow-sm font-black">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-ink-900">
                  Bạn có <span className="text-primary-700 font-extrabold">{pendingAssignments.length} bài tập về nhà</span> cần làm
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-black animate-pulse">
                  Chưa nộp
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Bài gần nhất: <strong className="text-foreground">{pendingAssignments[0].title}</strong> ({pendingAssignments[0].className})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              onClick={() => {
                setAssignmentTab('pending')
                setShowHomeworkModal(true)
              }}
              className="h-8.5 px-4 text-xs font-bold rounded bg-primary-500 hover:bg-primary-600 text-gray-950 shadow-sm gap-1"
            >
              Xem & làm bài
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Unpaid tuition alert banner */}
      {unpaidTuitions.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                  <span>Học phí cần thanh toán</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-extrabold">
                    Tháng {unpaidTuitions[0].currentMonth}/{unpaidTuitions[0].currentYear}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bạn có <strong className="text-red-700">{unpaidTuitions.length} lớp học</strong> chưa hoàn tất học phí tháng này.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setSelectedPayTuition(unpaidTuitions[0])}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow-md shadow-red-600/20 shrink-0 gap-1.5 h-8.5 px-4"
            >
              <QrCode className="h-4 w-4" />
              Đóng học phí ngay
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-red-100">
            {unpaidTuitions.map((t) => (
              <div
                key={t.classId}
                className="flex items-center justify-between p-2.5 rounded bg-background/80 border border-red-100 text-xs"
              >
                <span className="font-bold text-ink-900 truncate">{t.className}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-extrabold text-red-600">{formatCurrency(t.monthlyFee)}</span>
                  <button
                    onClick={() => setSelectedPayTuition(t)}
                    className="text-xs font-bold text-primary-700 hover:underline"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Level & Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-background border border-border rounded p-4 sm:p-5 shadow-sm flex items-center gap-4 hover:border-primary-200 transition-colors">
          <div className="w-11 h-11 rounded bg-blue-50 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Trình độ mục tiêu</p>
            <p className="font-extrabold text-foreground text-base mt-0.5">
              {studentProfile?.level || 'Đang cập nhật'}
            </p>
          </div>
        </div>

        <div className="bg-background border border-border rounded p-4 sm:p-5 shadow-sm flex items-center gap-4 hover:border-primary-200 transition-colors">
          <div className="w-11 h-11 rounded bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Mục tiêu học tập</p>
            <p className="font-extrabold text-foreground text-base mt-0.5">
              {studentProfile?.goal || 'Đang cập nhật'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full bg-primary-500" />
              <h2 className="font-bold text-ink-900 text-sm uppercase tracking-wider">
                Lớp học của tôi ({myClasses.length})
              </h2>
            </div>
            <Link to="/classes" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
              Tất cả lớp
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingMyClasses ? (
            <LoadingState variant="skeleton-cards" rows={2} />
          ) : myClasses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Bạn chưa tham gia lớp học nào"
              description="Liên hệ trung tâm hoặc dùng link mời để tham gia lớp."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myClasses.map((cls) => (
                <Link
                  key={cls.classId}
                  to={`/classes/${cls.classId}`}
                  className="bg-background border border-border rounded p-5 shadow-sm hover:border-primary-400 hover:shadow-md transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: cls.categoryColorHex || '#6B7280' }}
                    >
                      {cls.categoryName}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded">
                      Đang học
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink-900 group-hover:text-primary-600 transition-colors text-sm line-clamp-1">
                      {cls.className}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <UserIcon className="h-3 w-3 shrink-0" />
                      GV: {cls.teacherName}
                    </p>
                  </div>

                  <div className="border-t border-border pt-3 mt-auto space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      Lịch học: {cls.scheduleDays || 'Chưa cập nhật'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      Giờ học: {cls.scheduleTime || 'Chưa cập nhật'}
                    </div>
                    {cls.room && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        Phòng: {cls.room}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-ink-900 text-sm uppercase tracking-wider">
            Tiện ích & Hỗ trợ
          </h2>

          <div className="bg-background border border-border rounded p-5 shadow-sm space-y-3.5">
            <button
              onClick={() => setShowHomeworkModal(true)}
              className="w-full flex items-center justify-between p-3 rounded bg-primary-50/60 hover:bg-primary-100/70 border border-primary-200/70 text-xs font-bold text-foreground hover:text-ink-900 transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary-600 group-hover:scale-110 transition-transform" />
                <span>Bài tập của tôi</span>
              </div>
              {pendingAssignments.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-extrabold">
                  {pendingAssignments.length} cần làm
                </span>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">
                  {completedAssignments.length} đã xong
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="w-full flex items-center justify-between p-3 rounded bg-muted hover:bg-primary-50 border border-border text-xs font-bold text-foreground hover:text-primary-900 transition-all group"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary-500 group-hover:rotate-[-20deg] transition-transform" />
                <span>Lịch sử đóng học phí</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary-600 font-semibold">
                {allPaymentHistory.length} lần
              </span>
            </button>

            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary-500" />
                Liên hệ trung tâm
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Hotline: <strong className="text-ink-900 font-bold">0905 123 456</strong></p>
                <p>Địa chỉ: <span className="text-foreground">123 Ba Tháng Hai, Hải Châu, Đà Nẵng</span></p>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                Góc học tập
              </p>
              <Link
                to="/blog"
                className="flex items-center justify-between text-xs text-primary-600 hover:text-primary-700 font-bold group p-2 rounded bg-primary-50/50 hover:bg-primary-50 transition-colors"
              >
                Tin tức & Mẹo học tiếng Anh
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Homework Modal */}
      <Modal
        open={showHomeworkModal}
        onOpenChange={setShowHomeworkModal}
        title="Bài tập của tôi"
        description="Danh sách bài tập và bài kiểm tra từ các lớp học"
        size="lg"
        footer={
          <Button
            variant="secondary"
            className="rounded text-xs font-bold px-5"
            onClick={() => setShowHomeworkModal(false)}
          >
            Đóng
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded mb-3">
            <button
              onClick={() => setAssignmentTab('pending')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                assignmentTab === 'pending'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-ink-900'
              }`}
            >
              <span>Cần làm</span>
              {pendingAssignments.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-xs font-extrabold">
                  {pendingAssignments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAssignmentTab('completed')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                assignmentTab === 'completed'
                  ? 'bg-background text-ink-900 shadow-sm'
                  : 'text-muted-foreground hover:text-ink-900'
              }`}
            >
              <span>Đã hoàn thành</span>
              <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-foreground text-xs font-extrabold">
                {completedAssignments.length}
              </span>
            </button>
          </div>

          {myAssignments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Hiện tại chưa có bài tập nào được giao"
              description="Khi giáo viên giao bài tập trong lớp học của bạn, bài tập sẽ xuất hiện tại đây."
            />
          ) : assignmentTab === 'pending' ? (
            pendingAssignments.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Tuyệt vời! Bạn đã hoàn thành tất cả bài tập."
                description="Không có bài tập nào đang chờ nộp."
              />
            ) : (
              pendingAssignments.map((a) => (
                <div
                  key={a.assignmentId}
                  className={`rounded p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    a.isOverdue
                      ? 'bg-red-50/30 border-red-200'
                      : 'bg-muted/60 border-border hover:border-primary-300'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded text-white truncate max-w-[140px]"
                        style={{ backgroundColor: a.categoryColorHex || '#4F46E5' }}
                      >
                        {a.className}
                      </span>
                      {a.isOverdue ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Quá hạn nộp
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                          {a.assignmentType === 'Quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-ink-900 text-sm truncate">{a.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>Hạn nộp: <strong className={a.isOverdue ? 'text-red-600' : 'text-foreground'}>{formatDate(a.dueDate)}</strong></span>
                      <span className="text-gray-300">•</span>
                      <span>GV: {a.teacherName}</span>
                    </p>
                  </div>

                  <Link
                    to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}
                    onClick={() => setShowHomeworkModal(false)}
                    className="shrink-0"
                  >
                    <Button size="sm" className="h-8.5 text-xs font-bold rounded bg-primary-500 hover:bg-primary-600 text-gray-950 shadow-sm gap-1 w-full sm:w-auto">
                      Làm bài ngay
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))
            )
          ) : completedAssignments.length === 0 ? (
            <EmptyState title="Bạn chưa nộp bài tập nào." />
          ) : (
            completedAssignments.map((a) => (
              <div
                key={a.assignmentId}
                className="rounded p-4 border border-border bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-foreground truncate">
                      {a.className}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã nộp bài
                    </span>
                  </div>

                  <h3 className="font-bold text-ink-900 text-sm truncate">{a.title}</h3>

                  {a.grade !== null && a.grade !== undefined ? (
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                      <span className="font-bold text-primary-900">
                        {a.assignmentType === 'Quiz' ? `Đúng ${a.grade} câu` : `Điểm: ${a.grade}/10`}
                      </span>
                      {a.teacherFeedback && (
                        <span className="text-muted-foreground truncate">• {a.teacherFeedback}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Đang chờ chấm điểm</p>
                  )}
                </div>

                <Link
                  to={`/classes/${a.classId}/assignments/${a.assignmentId}/do`}
                  onClick={() => setShowHomeworkModal(false)}
                  className="shrink-0"
                >
                  <button className="text-xs font-bold text-primary-700 hover:underline">
                    Xem lại bài làm
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Pay Tuition VietQR Modal */}
      <Modal
        open={!!selectedPayTuition}
        onOpenChange={(open) => { if (!open) setSelectedPayTuition(null) }}
        title="Đóng học phí qua VietQR"
        description={selectedPayTuition ? `Lớp: ${selectedPayTuition.className}` : ''}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              className="flex-1 rounded text-xs font-bold"
              onClick={() => setSelectedPayTuition(null)}
            >
              Đóng
            </Button>
            <Button
              className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              loading={payTuitionMutation.isPending}
              disabled={!selectedPayTuition}
              onClick={() => {
                if (!selectedPayTuition) return
                payTuitionMutation.mutate({
                  classId: selectedPayTuition.classId,
                  month: selectedPayTuition.currentMonth,
                  year: selectedPayTuition.currentYear,
                  amount: selectedPayTuition.monthlyFee,
                  note: `Chuyển khoản VietQR tháng ${selectedPayTuition.currentMonth}`,
                })
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận đã chuyển khoản
            </Button>
          </>
        }
      >
        {selectedPayTuition && (
          <div className="space-y-4">
            <div className="p-4 rounded bg-primary-50 border border-primary-200 text-center space-y-1">
              <p className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                Học phí Tháng {selectedPayTuition.currentMonth}/{selectedPayTuition.currentYear}
              </p>
              <p className="text-2xl font-black text-primary-700 tracking-tight">
                {formatCurrency(selectedPayTuition.monthlyFee)}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded border border-border">
              <img
                src={`https://img.vietqr.io/image/MB-0905123456-compact2.png?amount=${selectedPayTuition.monthlyFee}&addInfo=${encodeURIComponent(
                  `MSNHU ${user?.fullName} T${selectedPayTuition.currentMonth}`
                )}&accountName=TRUNG%20TAM%20MS%20NHU`}
                alt="Mã VietQR"
                className="w-56 h-auto rounded shadow-md border border-white"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
                Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã thanh toán tự động
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Ngân hàng</p>
                  <p className="font-bold text-ink-900">MBBank (Ngân hàng Quân Đội)</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Số tài khoản</p>
                  <p className="font-bold text-ink-900 font-mono text-sm">0905 123 456</p>
                </div>
                <button
                  onClick={() => copyToClipboard('0905123456', 'stk')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-background border border-border font-bold text-xs text-foreground hover:bg-muted"
                >
                  {copiedField === 'stk' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Chủ tài khoản</p>
                  <p className="font-bold text-ink-900">TRUNG TAM TIENG ANH MS NHU</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-muted border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Nội dung chuyển khoản</p>
                  <p className="font-bold text-primary-700 font-mono">
                    MSNHU {user?.fullName} T{selectedPayTuition.currentMonth}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`MSNHU ${user?.fullName} T${selectedPayTuition.currentMonth}`, 'nd')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-background border border-border font-bold text-xs text-foreground hover:bg-muted"
                >
                  {copiedField === 'nd' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'nd' ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment History Modal */}
      <Modal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        title="Lịch sử đóng học phí"
        description="Các giao dịch và học phí đã thanh toán"
        size="md"
        footer={
          <Button
            variant="secondary"
            className="rounded text-xs font-bold px-5"
            onClick={() => setShowHistoryModal(false)}
          >
            Đóng
          </Button>
        }
      >
        <div className="space-y-3">
          {allPaymentHistory.length === 0 ? (
            <EmptyState title="Bạn chưa có lịch sử thanh toán học phí nào." />
          ) : (
            allPaymentHistory.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded border border-border bg-muted/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-ink-900 truncate">{p.className}</p>
                  <p className="text-muted-foreground">
                    Học phí Tháng {p.month}/{p.year} • Phương thức: <strong>{p.paymentMethod}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Thanh toán lúc: {formatDate(p.paidAt)}
                  </p>
                  {p.note && <p className="text-xs text-muted-foreground italic">Ghi chú: {p.note}</p>}
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-sm text-ink-900">{formatCurrency(p.amount)}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                      p.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'pending'
                        ? 'bg-primary-100 text-primary-800'
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
      </Modal>
    </PageLayout>
  )
}

import { GraduationCap, BookOpen, CreditCard, FileText, TrendingUp, Users } from 'lucide-react'

const stats = [
  { label: 'Học viên', value: '—', icon: GraduationCap, bg: 'bg-blue-50',   icon_color: 'text-blue-500',   border: 'border-blue-100' },
  { label: 'Lớp đang mở', value: '—', icon: BookOpen,   bg: 'bg-amber-50',  icon_color: 'text-amber-500',  border: 'border-amber-100' },
  { label: 'Học phí chưa đóng', value: '—', icon: CreditCard, bg: 'bg-red-50', icon_color: 'text-red-500', border: 'border-red-100' },
  { label: 'Giáo viên', value: '—', icon: Users,         bg: 'bg-purple-50', icon_color: 'text-purple-500', border: 'border-purple-100' },
]

export default function DashboardPage() {
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

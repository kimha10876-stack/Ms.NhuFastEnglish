import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { useUsers } from './useUsers'
import { Button } from '@/shared/components/ui/button'

type TabType = 'All' | 'Student' | 'Teacher'

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'All'
  const [activeTab, setActiveTab] = useState<TabType>(
    initialRole === 'Student' ? 'Student' : initialRole === 'Teacher' ? 'Teacher' : 'All'
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isRefetching, refetch } = useUsers({
    role: activeTab === 'All' ? '' : activeTab,
    search: search.trim(),
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    pageSize,
  })

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(1)
    if (tab === 'All') {
      searchParams.delete('role')
    } else {
      searchParams.set('role', tab)
    }
    setSearchParams(searchParams)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('Admin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ShieldAlert className="w-3 h-3" />
          Admin
        </span>
      )
    }
    if (roles.includes('Teacher')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <Briefcase className="w-3 h-3" />
          Giáo viên
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <GraduationCap className="w-3 h-3" />
        Học viên
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            Quản lý thành viên
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp danh sách học viên, giáo viên và nhân sự trong trung tâm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* ── Role Filter Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit border border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('All')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'All'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tất cả thành viên</span>
          {activeTab === 'All' && data?.totalCount !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {data.totalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('Student')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'Student'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <span>Học viên</span>
          {activeTab === 'Student' && data?.totalCount !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px]">
              {data.totalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('Teacher')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'Teacher'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-teal-500" />
          <span>Giáo viên</span>
          {activeTab === 'Teacher' && data?.totalCount !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[10px]">
              {data.totalCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* ── Unified Members Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <p className="text-xs">Đang tải danh sách thành viên...</p>
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">
              Không tìm thấy thành viên nào
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang tab vai trò khác.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Thành viên</th>
                  <th className="px-6 py-3.5">Vai trò</th>
                  <th className="px-6 py-3.5">Liên hệ</th>
                  <th className="px-6 py-3.5">Lớp học / Chuyên môn</th>
                  <th className="px-6 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.items.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Member Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.roles)}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.phoneNumber ? (
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {user.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có SĐT</span>
                      )}
                    </td>

                    {/* Classes / Specialization */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.roles.includes('Teacher') ? (
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-medium">
                            <BookOpen className="w-3 h-3" />
                            {user.teachingClassCount} lớp phụ trách
                          </span>
                          {user.teacherType && (
                            <span className="text-[10px] text-slate-400">
                              {user.teacherType === 'permanent' ? 'Chính thức' : 'Dự giờ'}
                            </span>
                          )}
                        </div>
                      ) : user.roles.includes('Student') ? (
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
                            <BookOpen className="w-3 h-3" />
                            {user.enrolledClassCount} lớp đang học
                          </span>
                          {user.studentLevel && (
                            <span className="text-[10px] text-slate-400">
                              {user.studentLevel}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Ban quản trị</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                          <XCircle className="w-3 h-3" />
                          Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Join Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Trang <strong className="text-slate-900 dark:text-white">{data.page}</strong> / {data.totalPages} (Tổng {data.totalCount} thành viên)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg h-8 px-2.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded-lg h-8 px-2.5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

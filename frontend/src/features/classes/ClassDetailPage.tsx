import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Info, Trash2, Plus, Copy, Link2,
  Clock, BookOpen, Loader2, Check, AlertTriangle, Search,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  useClassDetail, useUpdateClass, useDeleteClass,
  useAddMember, useRemoveMember, useCreateInvite, useSearchStudents,
  useActiveInvite, useRevokeInvite,
} from './useClasses'
import type { UpdateClassRequest } from './classes.types'
import TeacherSelect from './TeacherSelect'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

type Tab = 'members' | 'info'

const STATUS_OPTIONS = ['active', 'paused', 'ended']
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended:  'Đã kết thúc',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  ended:  'bg-gray-100 text-gray-500 border-gray-200',
}

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const isAdmin      = user?.roles.includes('Admin') ?? false

  const [tab, setTab]               = useState<Tab>('members')
  const [showAddMember, setShowAdd] = useState(false)
  const [searchQ, setSearchQ]       = useState('')
  const [addError, setAddError]     = useState('')
  const [expiryDays, setExpiryDays] = useState(30)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied]         = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const [editForm, setEditForm]     = useState<UpdateClassRequest | null>(null)
  const [editError, setEditError]   = useState('')

  const { data: cls, isLoading }                    = useClassDetail(id)
  const { mutate: update, isPending: updating }      = useUpdateClass(id)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass()
  const { mutate: addMember, isPending: adding }     = useAddMember(id)
  const { mutate: removeMember }                     = useRemoveMember(id)
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite()
  const { data: searchResults = [] }                 = useSearchStudents(searchQ)
  const { data: activeInvite }                       = useActiveInvite(id)
  const { mutate: revokeInvite, isPending: revokingInvite } = useRevokeInvite(id)

  const handleDelete = () => {
    if (!window.confirm('Bạn có chắc muốn xoá lớp học này?')) return
    deleteClass(id, { onSuccess: () => navigate('/classes') })
  }

  const handleAddMember = (studentId: string) => {
    setAddError('')
    addMember(studentId, {
      onSuccess: () => { setShowAdd(false); setSearchQ('') },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setAddError(msg ?? 'Thêm học sinh thất bại')
      },
    })
  }

  const handleInvite = () => {
    createInvite({ classId: id, expiryDays }, {
      onSuccess: () => {
        setShowInvite(false)
      },
    })
  }

  const startEdit = () => {
    if (!cls) return
    setEditForm({
      name: cls.name, categoryId: cls.categoryId, teacherId: cls.teacherId,
      status: cls.status, scheduleDays: cls.scheduleDays ?? '', scheduleTime: cls.scheduleTime ?? '',
      room: cls.room ?? '', note: cls.note ?? '', maxStudents: cls.maxStudents ?? undefined,
      endDate: cls.endDate ?? undefined,
    })
  }

  const handleUpdate = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!editForm) return
    setEditError('')
    update(editForm, {
      onSuccess: () => setEditForm(null),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setEditError(msg ?? 'Cập nhật thất bại')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-56 bg-gray-100 animate-pulse rounded-xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500">Không tìm thấy lớp học</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/classes')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/classes')}
          className="mt-0.5 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: cls.categoryColorHex }}
            >
              {cls.categoryName}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_COLOR[cls.status] ?? STATUS_COLOR.active}`}>
              {STATUS_LABEL[cls.status] ?? cls.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate">{cls.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cls.teacherName}</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-0.5 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Xoá lớp học"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'members'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Thành viên
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${tab === 'members' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {cls.members.length}
          </span>
        </button>
        <button
          onClick={() => setTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'info'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Info className="h-4 w-4" />
          Thông tin lớp
        </button>
      </div>

      {/* ── Members tab ── */}
      {tab === 'members' && (
        <div>
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button onClick={() => setShowAdd(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Thêm học viên
            </Button>

            {activeInvite ? (
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0 max-w-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-0">
                  <Link2 className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate text-gray-600 flex-1 text-xs font-mono">{activeInvite.inviteUrl}</span>
                  <button
                    onClick={() => handleCopy(activeInvite.inviteUrl)}
                    className="shrink-0 p-1 rounded-lg hover:bg-amber-100 transition-colors"
                    title="Sao chép link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in duration-200" />
                    ) : (
                      <Copy className="h-4 w-4 text-amber-600" />
                    )}
                  </button>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowInvite(true)}
                  className="h-[38px] text-xs font-semibold px-3"
                  title="Tạo lại link mới (thu hồi link cũ)"
                >
                  Tạo mới link
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowRevokeConfirm(true)}
                  className="h-[38px] px-3 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold"
                  title="Hủy link mời"
                >
                  Hủy link
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setShowInvite(true)} className="gap-1.5">
                <Link2 className="h-4 w-4" />
                Tạo link mời
              </Button>
            )}
          </div>

          {/* Member table */}
          {cls.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-gray-600 font-medium text-sm">Chưa có học viên nào</p>
              <p className="text-gray-400 text-xs mt-0.5">Thêm học viên hoặc chia sẻ link mời</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Học viên</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Ngày tham gia</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Trạng thái</th>
                    <th className="w-12 px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {cls.members.map((m) => (
                    <tr key={m.memberId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-amber-700">
                              {m.fullName[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{m.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                        {new Date(m.joinedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          Đang học
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeMember(m.memberId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <div>
          {editForm ? (
            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Tên lớp</label>
                <Input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, name: e.target.value } : p)}
                />
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Giáo viên phụ trách</label>
                  <TeacherSelect
                    value={editForm.teacherId ?? ''}
                    onChange={(val) => setEditForm((p) => p ? { ...p, teacherId: val } : p)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Trạng thái</label>
                <CustomDropdown
                  value={editForm.status ?? 'active'}
                  options={STATUS_OPTIONS.map((s) => ({ id: s, name: STATUS_LABEL[s] }))}
                  onChange={(val) => setEditForm((p) => p ? { ...p, status: val } : p)}
                />
              </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Lịch học</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {WEEKDAYS.map((day) => {
                      const currentDays = editForm.scheduleDays ? editForm.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean) : []
                      const isSelected = currentDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = isSelected
                              ? currentDays.filter((d) => d !== day)
                              : [...currentDays, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
                            setEditForm((p) => p ? { ...p, scheduleDays: newDays.join(',') } : p)
                          }}
                          className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/20'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Giờ học</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="time"
                        value={(editForm.scheduleTime || '').split('-')[0]?.trim() || ''}
                        onChange={(e) => {
                          const newStart = e.target.value
                          setEditForm((p) => {
                            if (!p) return null
                            const [, currentEnd = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                            return {
                              ...p,
                              scheduleTime: newStart || currentEnd ? `${newStart}-${currentEnd}` : '',
                            }
                          })
                        }}
                        className="w-full text-center"
                      />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">đến</span>
                    <div className="relative flex-1">
                      <Input
                        type="time"
                        value={(editForm.scheduleTime || '').split('-')[1]?.trim() || ''}
                        onChange={(e) => {
                          const newEnd = e.target.value
                          setEditForm((p) => {
                            if (!p) return null
                            const [currentStart = ''] = (p.scheduleTime || '').split('-').map((t) => t.trim())
                            return {
                              ...p,
                              scheduleTime: currentStart || newEnd ? `${currentStart}-${newEnd}` : '',
                            }
                          })
                        }}
                        className="w-full text-center"
                      />
                    </div>
                  </div>
                </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Ghi chú</label>
                <Input value={editForm.note ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, note: e.target.value } : p)}
                />
              </div>

              {editError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700">{editError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" onClick={() => setEditForm(null)}>Huỷ</Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-1 max-w-lg">
              <InfoRow icon={<BookOpen />} label="Danh mục"
                value={<span className="font-semibold text-gray-900">{cls.categoryName}</span>} />
              <InfoRow icon={<Clock />} label="Lịch học"
                value={
                  <span className="font-semibold text-gray-900">
                    {[cls.scheduleDays, cls.scheduleTime].filter(Boolean).join(' · ') || '—'}
                  </span>
                } />
              <InfoRow icon={<Users />} label="Học viên"
                value={
                  <span className="font-semibold text-gray-900">
                    {cls.members.length} học viên
                  </span>
                } />
              {cls.note && (
                <InfoRow icon={<Info />} label="Ghi chú"
                  value={<span className="text-gray-600">{cls.note}</span>} />
              )}

              <div className="pt-4">
                <Button onClick={startEdit} variant="secondary">Chỉnh sửa thông tin</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add member modal ── */}
      {showAddMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdd(false)
              setSearchQ('')
              setAddError('')
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[480px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Thêm học viên vào lớp</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tìm học viên đã đăng ký tài khoản tại hệ thống</p>
              </div>
              <button
                onClick={() => {
                  setShowAdd(false)
                  setSearchQ('')
                  setAddError('')
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  autoFocus
                  placeholder="Nhập tên hoặc email học viên..."
                  value={searchQ}
                  onChange={(e) => {
                    setSearchQ(e.target.value)
                    setAddError('')
                  }}
                  className="pl-10 pr-8 py-2.5 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-sm"
                />
                {searchQ && (
                  <button
                    onClick={() => setSearchQ('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Error banner */}
              {addError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {addError}
                  </p>
                </div>
              )}

              {/* Empty search state */}
              {searchQ.trim().length < 2 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Hãy nhập từ khóa tìm kiếm</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                    Nhập tối thiểu 2 ký tự (tên hoặc email) để hệ thống bắt đầu tìm kiếm học viên
                  </p>
                </div>
              )}

              {/* Search Results list */}
              {searchQ.trim().length >= 2 && (
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kết quả tìm kiếm ({searchResults.length})</p>
                  
                  {searchResults.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-100 rounded-xl bg-gray-50/50 py-4">
                      <p className="text-sm font-medium text-gray-500">Không tìm thấy học viên</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                        Hãy chắc chắn rằng học viên đã tạo tài khoản với email này
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white overflow-y-auto min-h-0">
                      {searchResults.map((s) => {
                        const isAlreadyMember = cls?.members.some(m => m.memberId === s.studentId)
                        
                        return (
                          <div
                            key={s.studentId}
                            className="flex items-center justify-between p-3.5 hover:bg-amber-50/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
                                <span className="text-xs font-bold text-amber-700">
                                  {s.fullName[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate leading-snug">{s.fullName}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{s.email}</p>
                              </div>
                            </div>

                            {isAlreadyMember ? (
                              <span className="text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg select-none">
                                Đã tham gia
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAddMember(s.studentId)}
                                disabled={adding}
                                className="h-8 rounded-lg text-xs px-3 gap-1 hover:bg-amber-500 hover:text-white transition-all font-semibold"
                              >
                                {adding ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3" />
                                    Thêm
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Invite modal ── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-1">Tạo link mời</h2>
            <p className="text-sm text-gray-500 mb-5">Học viên dùng link này để tham gia lớp</p>

            <div className="space-y-1.5 mb-5">
              <label className="text-sm font-semibold text-gray-700">Thời hạn (ngày)</label>
              <Input
                type="number" min="0"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
              />
              <p className="text-xs text-gray-400">Nhập 0 để link không bao giờ hết hạn</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowInvite(false)}>Huỷ</Button>
              <Button className="flex-1" onClick={handleInvite} disabled={creatingInvite}>
                {creatingInvite ? <><Loader2 className="h-4 w-4 animate-spin" />Đang tạo...</> : 'Tạo link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Revoke confirm modal ── */}
      {showRevokeConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200"
          onClick={() => setShowRevokeConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4 mx-auto">
              <AlertTriangle className="h-6 w-6 shrink-0" />
            </div>
            
            <h3 className="text-center font-bold text-lg text-gray-900 mb-2">Hủy link mời học viên?</h3>
            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn hủy link mời này? Học sinh sẽ không thể tham gia lớp học qua link này được nữa.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl text-xs font-semibold"
                onClick={() => setShowRevokeConfirm(false)}
              >
                Quay lại
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl text-xs font-semibold border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold shadow-sm"
                onClick={() => {
                  revokeInvite(undefined, {
                    onSuccess: () => setShowRevokeConfirm(false)
                  })
                }}
                disabled={revokingInvite}
              >
                {revokingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-500 mt-0.5 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  )
}

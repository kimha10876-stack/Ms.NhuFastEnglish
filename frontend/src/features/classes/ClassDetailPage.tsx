import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Info, Trash2, Plus, Copy, Check, Link2,
  Clock, MapPin, BookOpen
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  useClassDetail, useUpdateClass, useDeleteClass,
  useAddMember, useRemoveMember, useCreateInvite, useSearchStudents,
} from './useClasses'
import type { UpdateClassRequest } from './classes.types'

type Tab = 'members' | 'info'

const STATUS_OPTIONS = ['active', 'paused', 'ended']
const STATUS_LABEL: Record<string, string> = { active: 'Đang hoạt động', paused: 'Tạm dừng', ended: 'Đã kết thúc' }

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const isAdmin      = user?.roles.includes('Admin') ?? false

  const [tab, setTab]               = useState<Tab>('members')
  const [showAddMember, setShowAdd] = useState(false)
  const [searchQ, setSearchQ]       = useState('')
  const [addError, setAddError]     = useState('')
  const [inviteLink, setInviteLink] = useState<{ url: string; copied: boolean } | null>(null)
  const [expiryDays, setExpiryDays] = useState(30)
  const [showInvite, setShowInvite] = useState(false)

  const [editForm, setEditForm]     = useState<UpdateClassRequest | null>(null)
  const [editError, setEditError]   = useState('')

  const { data: cls, isLoading } = useClassDetail(id)
  const { mutate: update, isPending: updating } = useUpdateClass(id)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass()
  const { mutate: addMember, isPending: adding } = useAddMember(id)
  const { mutate: removeMember } = useRemoveMember(id)
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite()
  const { data: searchResults = [] } = useSearchStudents(searchQ)

  const handleDelete = () => {
    if (!window.confirm('Bạn có chắc muốn xoá lớp học này?')) return
    deleteClass(id, { onSuccess: () => navigate('/classes') })
  }

  const handleAddMember = (studentId: string) => {
    setAddError('')
    addMember(studentId, {
      onSuccess: () => {
        setShowAdd(false)
        setSearchQ('')
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setAddError(msg ?? 'Thêm học sinh thất bại')
      },
    })
  }

  const handleInvite = () => {
    createInvite(
      { classId: id, expiryDays },
      {
        onSuccess: (link) => {
          setInviteLink({ url: link.inviteUrl, copied: false })
          setShowInvite(false)
        },
      }
    )
  }

  const copyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink.url).then(() => {
      setInviteLink((prev) => prev ? { ...prev, copied: true } : prev)
      setTimeout(() => setInviteLink((prev) => prev ? { ...prev, copied: false } : prev), 2000)
    })
  }

  const startEdit = () => {
    if (!cls) return
    setEditForm({
      name:         cls.name,
      categoryId:   cls.categoryId,
      teacherId:    cls.teacherId,
      status:       cls.status,
      scheduleDays: cls.scheduleDays ?? '',
      scheduleTime: cls.scheduleTime ?? '',
      room:         cls.room ?? '',
      note:         cls.note ?? '',
      maxStudents:  cls.maxStudents ?? undefined,
      endDate:      cls.endDate ?? undefined,
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
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="p-6 text-center py-24">
        <p className="text-muted-foreground">Không tìm thấy lớp học</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/classes')}>
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/classes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold text-white px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: cls.categoryColorHex }}
            >
              {cls.categoryName}
            </span>
            <span className="text-xs text-muted-foreground">
              {STATUS_LABEL[cls.status] ?? cls.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 truncate">{cls.name}</h1>
          <p className="text-sm text-muted-foreground">{cls.teacherName}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/5 border-destructive/30"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(['members', 'info'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'members' ? <><Users className="h-4 w-4" />Thành viên ({cls.members.length})</> : <><Info className="h-4 w-4" />Thông tin lớp</>}
          </button>
        ))}
      </div>

      {/* ── Members tab ── */}
      {tab === 'members' && (
        <div>
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button onClick={() => setShowAdd(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm học sinh
            </Button>

            {inviteLink ? (
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-sm flex-1 min-w-0">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-muted-foreground flex-1">{inviteLink.url}</span>
                <button
                  onClick={copyLink}
                  className="text-primary hover:opacity-70 transition-opacity shrink-0"
                >
                  {inviteLink.copied
                    ? <Check className="h-4 w-4 text-green-600" />
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowInvite(true)} className="gap-2">
                <Link2 className="h-4 w-4" />
                Tạo link mời
              </Button>
            )}
          </div>

          {/* Member table */}
          {cls.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-muted/30">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Chưa có học sinh nào trong lớp</p>
            </div>
          ) : (
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Học sinh</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Ngày tham gia</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {cls.members.map((m, i) => (
                    <tr key={m.memberId} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/5'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {m.fullName[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{m.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {new Date(m.joinedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeMember(m.memberId)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
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
                <label className="text-sm font-medium">Tên lớp</label>
                <Input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, name: e.target.value } : p)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select
                    className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editForm.status ?? 'active'}
                    onChange={(e) => setEditForm((p) => p ? { ...p, status: e.target.value } : p)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Giới hạn học sinh</label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.maxStudents ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => p ? {
                        ...p, maxStudents: e.target.value ? Number(e.target.value) : undefined
                      } : p)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Lịch học</label>
                  <Input
                    value={editForm.scheduleDays ?? ''}
                    onChange={(e) => setEditForm((p) => p ? { ...p, scheduleDays: e.target.value } : p)}
                    placeholder="T2,T4,T6"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Giờ học</label>
                  <Input
                    value={editForm.scheduleTime ?? ''}
                    onChange={(e) => setEditForm((p) => p ? { ...p, scheduleTime: e.target.value } : p)}
                    placeholder="08:00-10:00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phòng học</label>
                <Input
                  value={editForm.room ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, room: e.target.value } : p)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ghi chú</label>
                <Input
                  value={editForm.note ?? ''}
                  onChange={(e) => setEditForm((p) => p ? { ...p, note: e.target.value } : p)}
                />
              </div>

              {editError && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                  {editError}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setEditForm(null)}>Huỷ</Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 max-w-lg">
              <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Danh mục" value={cls.categoryName} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Lịch học"
                value={[cls.scheduleDays, cls.scheduleTime].filter(Boolean).join(' · ') || '—'} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Phòng học" value={cls.room || '—'} />
              <InfoRow icon={<Users className="h-4 w-4" />} label="Giới hạn học sinh"
                value={cls.maxStudents ? `${cls.members.length}/${cls.maxStudents}` : `${cls.members.length} (không giới hạn)`} />
              {cls.note && <InfoRow icon={<Info className="h-4 w-4" />} label="Ghi chú" value={cls.note} />}

              <Button onClick={startEdit} className="mt-2">Chỉnh sửa thông tin</Button>
            </div>
          )}
        </div>
      )}

      {/* ── Add member modal ── */}
      {showAddMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b">
              <h2 className="font-bold text-lg">Thêm học sinh vào lớp</h2>
            </div>
            <div className="p-5 space-y-3">
              <Input
                autoFocus
                placeholder="Tìm theo tên hoặc email..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />

              {searchQ.trim().length >= 2 && (
                <div className="border rounded-xl overflow-hidden divide-y max-h-64 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy học sinh</p>
                  ) : (
                    searchResults.map((s) => (
                      <button
                        key={s.studentId}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => handleAddMember(s.studentId)}
                        disabled={adding}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{s.fullName[0]?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {addError && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">{addError}</p>
              )}

              <Button variant="outline" className="w-full" onClick={() => { setShowAdd(false); setSearchQ('') }}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create invite modal ── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-bold text-lg">Tạo link mời</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Thời hạn (ngày)</label>
              <Input
                type="number"
                min="0"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Nhập 0 để link không hết hạn</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>Huỷ</Button>
              <Button className="flex-1" onClick={handleInvite} disabled={creatingInvite}>
                {creatingInvite ? 'Đang tạo...' : 'Tạo link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Check, ShieldAlert } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { Modal, EmptyState, LoadingState, SearchInput, Pagination } from '@/shared/components'
import { useSettingsUsers, useUpdateUserRoles } from '../../useSettings'
import type { UserWithRoles } from '../../settings.api'

export function UserRolesTab() {
  const { data: users = [], isLoading: loadingUsers } = useSettingsUsers()
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [userRolesForm, setUserRolesForm] = useState<string[]>([])
  const { mutate: updateUserRoles, isPending: updatingUserRoles } = useUpdateUserRoles(selectedUser?.id ?? '')
  const [userRolesError, setUserRolesError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [rolesPage, setRolesPage] = useState(1)
  const rolesPageSize = 10

  const openRolesDialog = (userItem: UserWithRoles) => {
    setUserRolesError('')
    setSelectedUser(userItem)
    setUserRolesForm(userItem.roles)
  }

  const handleUpdateRoles = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setUserRolesError('')

    updateUserRoles(
      { roles: userRolesForm },
      {
        onSuccess: () => setSelectedUser(null),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cập nhật phân quyền thất bại'
          setUserRolesError(msg)
        },
      }
    )
  }

  const toggleRoleInForm = (role: string) => {
    setUserRolesForm((p) =>
      p.includes(role) ? p.filter((r) => r !== role) : [...p, role]
    )
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase().trim()
    if (q) {
      const matchText = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      if (!matchText) return false
    }
    if (roleFilter) {
      const hasRole = u.roles.includes(roleFilter)
      if (!hasRole) return false
    }
    return true
  })

  const totalRolesUsers = filteredUsers.length
  const totalRolesPages = Math.ceil(totalRolesUsers / rolesPageSize) || 1
  const activeRolesPage = Math.min(rolesPage, totalRolesPages)
  const paginatedUsers = filteredUsers.slice(
    (activeRolesPage - 1) * rolesPageSize,
    activeRolesPage * rolesPageSize
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-ink-900">Phân quyền thành viên</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Tìm kiếm thành viên và quản lý các quyền (vai trò) hệ thống</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto shrink-0 animate-in fade-in duration-200">
          <SearchInput
            placeholder="Tìm theo tên hoặc email..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value)
              setRolesPage(1)
            }}
            onClear={() => setUserSearch('')}
            containerClassName="w-full sm:w-60"
          />
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={roleFilter}
              options={[
                { id: '', name: 'Tất cả vai trò' },
                { id: 'Admin', name: 'Quản trị viên (Admin)' },
                { id: 'Teacher', name: 'Giáo viên (Teacher)' },
                { id: 'Student', name: 'Học viên (Student)' },
              ]}
              onChange={(val) => {
                setRoleFilter(val)
                setRolesPage(1)
              }}
            />
          </div>
        </div>
      </div>

      {loadingUsers ? (
        <LoadingState variant="skeleton-rows" rows={5} />
      ) : paginatedUsers.length === 0 ? (
        <EmptyState title="Không tìm thấy thành viên phù hợp" />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-border bg-background divide-y divide-gray-100">
          <div className="grid grid-cols-12 bg-muted px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Thành viên</span>
            <span className="col-span-5">Quyền hạn (Roles)</span>
            <span className="col-span-2 text-right">Hành động</span>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedUsers.map((u) => (
              <div key={u.id} className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-muted/50">
                <div className="col-span-5 min-w-0 pr-4">
                  <p className="truncate text-sm font-semibold text-ink-900">{u.fullName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{u.email}</p>
                </div>

                <div className="col-span-5 flex flex-wrap gap-1.5">
                  {u.roles.map((role) => (
                    <span
                      key={role}
                      className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                        role === 'Admin'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : role === 'Teacher'
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>

                <div className="col-span-2 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openRolesDialog(u)}
                    className="h-8 rounded text-xs"
                  >
                    Sửa quyền
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={activeRolesPage}
            totalPages={totalRolesPages}
            totalCount={totalRolesUsers}
            pageSize={rolesPageSize}
            onPageChange={setRolesPage}
            itemLabel="thành viên"
            bordered
          />
        </div>
      )}

      <Modal
        open={!!selectedUser}
        onOpenChange={(open) => { if (!open) setSelectedUser(null) }}
        title="Phân quyền vai trò"
        description={selectedUser ? `Thay đổi quyền hạn cho ${selectedUser.fullName}` : ''}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setSelectedUser(null)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="roles-form" loading={updatingUserRoles} className="flex-1 text-xs font-bold">
              Lưu lại
            </Button>
          </>
        }
      >
        <form id="roles-form" onSubmit={handleUpdateRoles} className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chọn các vai trò áp dụng</p>
            <div className="space-y-2.5">
              {['Admin', 'Teacher', 'Student'].map((role) => {
                const isChecked = userRolesForm.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRoleInForm(role)}
                    className={`flex w-full items-center justify-between rounded border p-3 text-left transition-all hover:bg-muted ${
                      isChecked
                        ? 'border-primary-500 bg-primary-50/20 text-primary-900'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-xs font-bold uppercase ${
                        role === 'Admin'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : role === 'Teacher'
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}>
                        {role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {role === 'Admin' && 'Toàn quyền cấu hình, quản trị'}
                        {role === 'Teacher' && 'Giảng dạy, quản lý lớp'}
                        {role === 'Student' && 'Xem tài liệu, tham gia lớp'}
                      </span>
                    </div>
                    <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                      isChecked ? 'border-primary-600 bg-primary-500 text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {userRolesError && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-r-xl border-l-4 border-red-500 bg-red-50 px-4 py-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[13px] font-medium text-red-700">{userRolesError}</p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}

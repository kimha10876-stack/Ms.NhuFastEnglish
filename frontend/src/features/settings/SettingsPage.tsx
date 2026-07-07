import { useState } from 'react'
import {
  Settings, BookOpen, Users, Plus, Edit2, Trash2, Save,
  Check, Loader2, Sparkles, Building, Phone, MapPin, Mail,
  Globe, AlertCircle, ShieldAlert,
  MessageCircle, Award, Star, Briefcase, GraduationCap, Flame,
  Search, ChevronLeft, ChevronRight,
} from 'lucide-react'

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  'message-circle': MessageCircle,
  'award': Award,
  'star': Star,
  'book-open': BookOpen,
  'briefcase': Briefcase,
  'graduation-cap': GraduationCap,
  'flame': Flame,
  'sparkles': Sparkles,
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = ICON_COMPONENTS[name] || BookOpen
  return <IconComponent className={className} />
}
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useSystemSettings, useSaveSettings,
  useSettingsUsers, useUpdateUserRoles,
} from './useSettings'
import {
  useClassCategories, useCreateCategory,
  useUpdateCategory, useDeleteCategory,
} from '@/features/classes/useClasses'
import type { ClassCategory } from '@/features/classes/classes.types'

type ActiveTab = 'system' | 'categories' | 'roles'

const PRESET_COLORS = [
  '#007AFF', // Blue
  '#30D158', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#5856D6', // Indigo
  '#F59E0B', // Amber
  '#10B981', // Emerald
]

const AVAILABLE_ICONS = [
  { name: 'message-circle', label: 'Tin nhắn' },
  { name: 'award', label: 'Giải thưởng' },
  { name: 'star', label: 'Ngôi sao' },
  { name: 'book-open', label: 'Sách mở' },
  { name: 'briefcase', label: 'Doanh nghiệp' },
  { name: 'graduation-cap', label: 'Học tập' },
  { name: 'flame', label: 'Nhiệt huyết' },
  { name: 'sparkles', label: 'Lấp lánh' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('system')

  // ── Tab 1: System settings hooks ──
  const { data: settings = [], isLoading: loadingSettings } = useSystemSettings()
  const { mutate: saveSettings, isPending: savingSettings } = useSaveSettings()
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})
  const [initSettings, setInitSettings] = useState(false)

  // ── Tab 2: Categories hooks ──
  const { data: categories = [], isLoading: loadingCategories } = useClassCategories()
  const { mutate: createCategory, isPending: creatingCategory } = useCreateCategory()
  const { mutate: updateCategory, isPending: updatingCategory } = useUpdateCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ClassCategory | null>(null)
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState(PRESET_COLORS[0])
  const [catIcon, setCatIcon] = useState(AVAILABLE_ICONS[0].name)
  const [catSort, setCatSort] = useState(1)
  const [catError, setCatError] = useState('')

  // ── Tab 3: User roles hooks ──
  const { data: users = [], isLoading: loadingUsers } = useSettingsUsers()
  const [selectedUser, setSelectedUser] = useState<{ id: string; fullName: string; roles: string[] } | null>(null)
  const [userRolesForm, setUserRolesForm] = useState<string[]>([])
  const { mutate: updateUserRoles, isPending: updatingUserRoles } = useUpdateUserRoles(selectedUser?.id ?? '')
  const [userRolesError, setUserRolesError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [rolesPage, setRolesPage] = useState(1)
  const rolesPageSize = 10

  // Initialize settings form values once data is fetched
  if (settings.length > 0 && !initSettings) {
    const form: Record<string, string> = {}
    settings.forEach((s) => {
      form[s.key] = s.value
    })
    setSettingsForm(form)
    setInitSettings(true)
  }

  // ── Tab 1: Handle System settings save ──
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings({ settings: settingsForm }, {
      onSuccess: () => alert('Lưu cấu hình hệ thống thành công!'),
    })
  }

  // ── Tab 2: Handle Category CRUD ──
  const openCategoryDialog = (cat: ClassCategory | null) => {
    setCatError('')
    if (cat) {
      setSelectedCategory(cat)
      setCatName(cat.name)
      setCatColor(cat.colorHex)
      setCatIcon(cat.icon)
      setCatSort(1) // Sorting order can be managed or default
    } else {
      setSelectedCategory(null)
      setCatName('')
      setCatColor(PRESET_COLORS[0])
      setCatIcon(AVAILABLE_ICONS[0].name)
      setCatSort(categories.length + 1)
    }
    setShowCategoryModal(true)
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    setCatError('')

    if (!catName.trim()) {
      setCatError('Vui lòng nhập tên danh mục')
      return
    }

    if (selectedCategory) {
      updateCategory(
        {
          id: selectedCategory.id,
          body: { name: catName, colorHex: catColor, icon: catIcon, sortOrder: catSort },
        },
        {
          onSuccess: () => setShowCategoryModal(false),
          onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Cập nhật danh mục thất bại'
            setCatError(msg)
          },
        }
      )
    } else {
      createCategory(
        { name: catName, colorHex: catColor, icon: catIcon, sortOrder: catSort },
        {
          onSuccess: () => setShowCategoryModal(false),
          onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Tạo danh mục thất bại'
            setCatError(msg)
          },
        }
      )
    }
  }

  const handleDeleteCategory = (cat: ClassCategory) => {
    if (!window.confirm(`Bạn có chắc muốn xoá danh mục "${cat.name}"?`)) return
    deleteCategory(cat.id, {
      onSuccess: (res: any) => {
        if (res?.message) {
          alert(res.message)
        }
      },
    })
  }



  // ── Tab 3: Handle User roles update ──
  const openRolesDialog = (user: any) => {
    setUserRolesError('')
    setSelectedUser(user)
    setUserRolesForm(user.roles)
  }

  const handleUpdateRoles = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setUserRolesError('')

    updateUserRoles(
      { roles: userRolesForm },
      {
        onSuccess: () => setSelectedUser(null),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Cập nhật phân quyền thất bại'
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

  // Filter users based on search query and role filter
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

  // Paginate users client-side
  const totalRolesUsers = filteredUsers.length
  const totalRolesPages = Math.ceil(totalRolesUsers / rolesPageSize) || 1
  const activeRolesPage = Math.min(rolesPage, totalRolesPages)
  const paginatedUsers = filteredUsers.slice(
    (activeRolesPage - 1) * rolesPageSize,
    activeRolesPage * rolesPageSize
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Quản trị viên</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cấu hình hệ thống</h1>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        {[
          { id: 'system', label: 'Thông tin trung tâm', icon: Building },
          { id: 'categories', label: 'Danh mục lớp học', icon: BookOpen },
          { id: 'roles', label: 'Phân quyền thành viên', icon: Users },
        ].map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[2px] ${
                isActive
                  ? 'border-amber-500 text-amber-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* ── Tab 1: System Settings ── */}
        {activeTab === 'system' && (
          <div>
            {loadingSettings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-gray-400" />
                      Tên trung tâm
                    </label>
                    <Input
                      value={settingsForm.CenterName ?? ''}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, CenterName: e.target.value }))}
                      placeholder="VD: Ms. Nhụ Fast English"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-gray-400" />
                        Số điện thoại Hotline
                      </label>
                      <Input
                        value={settingsForm.Hotline ?? ''}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, Hotline: e.target.value }))}
                        placeholder="VD: 0905 123 456"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-gray-400" />
                        Email liên hệ
                      </label>
                      <Input
                        type="email"
                        value={settingsForm.Email ?? ''}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, Email: e.target.value }))}
                        placeholder="VD: contact@msnhu.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      Địa chỉ liên hệ
                    </label>
                    <Input
                      value={settingsForm.Address ?? ''}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, Address: e.target.value }))}
                      placeholder="VD: 123 Ba Tháng Hai, Hải Châu, Đà Nẵng"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-gray-400" />
                      Liên kết Facebook Fanpage
                    </label>
                    <Input
                      value={settingsForm.FacebookUrl ?? ''}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, FacebookUrl: e.target.value }))}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button type="submit" disabled={savingSettings} className="gap-1.5">
                    {savingSettings ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Lưu cấu hình
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Tab 2: Class Categories ── */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Danh mục lớp học</h3>
                <p className="text-xs text-gray-500 mt-0.5">Quản lý danh sách các danh mục đào tạo tại trung tâm</p>
              </div>
              <Button onClick={() => openCategoryDialog(null)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>

            {loadingCategories ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                Không tìm thấy danh mục nào. Hãy tạo danh mục đầu tiên!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-5 border border-gray-200 rounded-2xl bg-white flex flex-col gap-4 relative group hover:border-amber-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: cat.colorHex }}
                        >
                          <CategoryIcon name={cat.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{cat.name}</h4>
                          <span className="text-[10px] text-gray-400 font-medium font-mono">ID: {cat.id}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openCategoryDialog(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xoá"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto text-xs">
                      <span className="text-gray-400">Thứ tự hiển thị: <span className="font-bold text-gray-700">{cat.id}</span></span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md">
                          Hoạt động
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Member Permissions / User Roles ── */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Phân quyền thành viên</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tìm kiếm thành viên và quản lý các quyền (vai trò) hệ thống</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 animate-in fade-in duration-200">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên hoặc email..."
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setRolesPage(1); }}
                    className="pl-9 w-full rounded-xl text-xs"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <CustomDropdown
                    value={roleFilter}
                    options={[
                      { id: '', name: 'Tất cả vai trò' },
                      { id: 'Admin', name: 'Quản trị viên (Admin)' },
                      { id: 'Teacher', name: 'Giáo viên (Teacher)' },
                      { id: 'Student', name: 'Học viên (Student)' },
                    ]}
                    onChange={(val: string) => { setRoleFilter(val); setRolesPage(1); }}
                  />
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                Không tìm thấy thành viên phù hợp.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 flex flex-col bg-white">
                <div className="bg-gray-50 px-4 py-2.5 grid grid-cols-12 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <span className="col-span-5">Thành viên</span>
                  <span className="col-span-5">Quyền hạn (Roles)</span>
                  <span className="col-span-2 text-right">Hành động</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {paginatedUsers.map((u) => (
                    <div key={u.id} className="px-4 py-3 grid grid-cols-12 items-center hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-5 min-w-0 pr-4">
                        <p className="font-semibold text-sm text-gray-900 truncate">{u.fullName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                      </div>

                      <div className="col-span-5 flex flex-wrap gap-1.5">
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                              role === 'Admin'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : role === 'Teacher'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                          className="h-8 rounded-lg text-xs"
                        >
                          Sửa quyền
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Roles Pagination */}
                {totalRolesPages > 1 && (
                  <div className="px-4 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-semibold text-gray-500">
                      Hiển thị thành viên từ <span className="font-bold text-gray-900">{((activeRolesPage - 1) * rolesPageSize) + 1}</span> đến{' '}
                      <span className="font-bold text-gray-900">
                        {Math.min(activeRolesPage * rolesPageSize, totalRolesUsers)}
                      </span>{' '}
                      trong tổng số <span className="font-bold text-gray-900">{totalRolesUsers}</span> thành viên
                    </p>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRolesPage((p) => Math.max(p - 1, 1))}
                        disabled={activeRolesPage === 1}
                        className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: totalRolesPages }).map((_, idx) => {
                        const pNum = idx + 1
                        if (totalRolesPages > 5 && Math.abs(pNum - activeRolesPage) > 1 && pNum !== 1 && pNum !== totalRolesPages) {
                          if (pNum === 2 || pNum === totalRolesPages - 1) {
                            return <span key={pNum} className="text-xs text-gray-400 px-1 font-bold">...</span>
                          }
                          return null
                        }

                        return (
                          <Button
                            key={pNum}
                            variant={activeRolesPage === pNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRolesPage(pNum)}
                            className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all ${
                              activeRolesPage === pNum
                                ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 hover:text-white'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {pNum}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRolesPage((p) => Math.min(p + 1, totalRolesPages))}
                        disabled={activeRolesPage === totalRolesPages}
                        className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialog 1: Add/Edit Category Modal ── */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowCategoryModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {selectedCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Nhập các thông tin cơ bản cho danh mục</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="VD: Tiếng Anh Giao Tiếp"
                  required
                  autoFocus
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                  Màu đại diện
                  <span className="font-mono text-xs text-gray-400 uppercase">{catColor}</span>
                </label>
                <div className="flex gap-2 flex-wrap items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        catColor === c ? 'ring-2 ring-amber-500 ring-offset-2 scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom color picker */}
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0 overflow-hidden shrink-0"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Icon hiển thị</label>
                <div className="grid grid-cols-4 gap-2 border border-gray-100 bg-gray-50 rounded-xl p-2.5 max-h-40 overflow-y-auto">
                  {AVAILABLE_ICONS.map((i) => {
                    const isSelected = catIcon === i.name
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setCatIcon(i.name)}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-lg border text-xs gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <CategoryIcon name={i.name} className="h-4 w-4" />
                        <span className="text-[10px] truncate max-w-full px-1">{i.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Thứ tự ưu tiên (Sort order)</label>
                <Input
                  type="number"
                  min="1"
                  value={catSort}
                  onChange={(e) => setCatSort(Number(e.target.value))}
                />
              </div>

              {catError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {catError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1 animate-in fade-in" onClick={() => setShowCategoryModal(false)}>
                  Huỷ bỏ
                </Button>
                <Button type="submit" className="flex-1" disabled={creatingCategory || updatingCategory}>
                  {creatingCategory || updatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu lại'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dialog 2: Change User Roles Modal ── */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Phân quyền vai trò</h2>
                <p className="text-xs text-gray-500 mt-0.5">Thay đổi quyền hạn cho {selectedUser.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRoles} className="p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chọn các vai trò áp dụng</p>
                
                <div className="space-y-2.5">
                  {['Admin', 'Teacher', 'Student'].map((role) => {
                    const isChecked = userRolesForm.includes(role)
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRoleInForm(role)}
                        className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all hover:bg-gray-50 text-left ${
                          isChecked
                            ? 'border-amber-500 bg-amber-50/20 text-amber-900'
                            : 'border-gray-200 text-gray-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${
                            role === 'Admin'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : role === 'Teacher'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {role === 'Admin' && 'Toàn quyền cấu hình, quản trị'}
                            {role === 'Teacher' && 'Giảng dạy, quản lý lớp'}
                            {role === 'Student' && 'Xem tài liệu, tham gia lớp'}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-amber-500 border-amber-600 text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {userRolesError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl">
                  <p className="text-[13px] text-red-700 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    {userRolesError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setSelectedUser(null)}>
                  Huỷ bỏ
                </Button>
                <Button type="submit" className="flex-1" disabled={updatingUserRoles}>
                  {updatingUserRoles ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu lại'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import {
  BookOpen, Edit2, Trash2,
  MessageCircle, Award, Star, Briefcase, GraduationCap, Flame, Sparkles,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal, EmptyState, LoadingState, Pagination, StatusBadge } from '@/shared/components'
import { SettingsCollectionHeader } from '../SettingsCollectionHeader'
import { LimitedTextInput } from '../LimitedTextInput'
import { TruncatedName } from '../TruncatedName'
import { CATEGORY_NAME_MAX, SETTINGS_PAGE_SIZE, type SettingsViewMode } from '../../settings.constants'
import { paginateItems } from '../../utils/paginate'
import {
  useClassCategories, useCreateCategory,
  useUpdateCategory, useDeleteCategory,
} from '@/features/classes/useClasses'
import type { ClassCategory } from '@/features/classes/classes.types'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { toast } from '@/shared/utils/toast'

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

const PRESET_COLORS = [
  '#007AFF',
  '#30D158',
  '#FF9500',
  '#FF3B30',
  '#AF52DE',
  '#5856D6',
  '#F59E0B',
  '#10B981',
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

export function ClassCategoriesTab() {
  const { ask, close, setLoading, confirmDialog } = useConfirmDialog()
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
  const [categoriesView, setCategoriesView] = useState<SettingsViewMode>('card')
  const [categoriesPage, setCategoriesPage] = useState(1)

  const paginatedCategories = paginateItems(categories, categoriesPage, SETTINGS_PAGE_SIZE)

  const openCategoryDialog = (cat: ClassCategory | null) => {
    if (cat) {
      setSelectedCategory(cat)
      setCatName(cat.name)
      setCatColor(cat.colorHex)
      setCatIcon(cat.icon)
      setCatSort(1)
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

    if (!catName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }
    if (catName.length > CATEGORY_NAME_MAX) {
      toast.error(`Tên danh mục tối đa ${CATEGORY_NAME_MAX} ký tự`)
      return
    }

    if (selectedCategory) {
      updateCategory(
        {
          id: selectedCategory.id,
          body: { name: catName.trim(), colorHex: catColor, icon: catIcon, sortOrder: catSort },
        },
        {
          onSuccess: () => {
            setShowCategoryModal(false)
            toast.success('Cập nhật danh mục lớp học thành công!')
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Cập nhật danh mục thất bại')
          },
        }
      )
    } else {
      createCategory(
        { name: catName.trim(), colorHex: catColor, icon: catIcon, sortOrder: catSort },
        {
          onSuccess: () => {
            setShowCategoryModal(false)
            toast.success('Thêm danh mục lớp học thành công!')
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Tạo danh mục thất bại')
          },
        }
      )
    }
  }

  const handleDeleteCategory = (cat: ClassCategory) => {
    ask({
      title: 'Xóa danh mục lớp học',
      description: `Bạn có chắc muốn xoá danh mục "${cat.name}"?`,
      confirmLabel: 'Xóa',
      onConfirm: () => {
        setLoading(true)
        deleteCategory(cat.id, {
          onSuccess: (res: { message?: string }) => {
            toast.success(res?.message || 'Xóa danh mục thành công')
            close()
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Xóa danh mục thất bại')
          },
          onSettled: () => setLoading(false),
        })
      },
    })
  }

  return (
    <div>
      <SettingsCollectionHeader
        title="Danh mục lớp học"
        description="Quản lý danh sách các danh mục đào tạo tại trung tâm"
        addLabel="Thêm danh mục"
        onAdd={() => openCategoryDialog(null)}
        viewMode={categoriesView}
        onViewModeChange={(mode) => {
          setCategoriesView(mode)
          setCategoriesPage(1)
        }}
      />

      {loadingCategories ? (
        <LoadingState variant={categoriesView === 'card' ? 'skeleton-cards' : 'skeleton-rows'} rows={3} />
      ) : categories.length === 0 ? (
        <EmptyState title="Không tìm thấy danh mục nào" description="Hãy tạo danh mục đầu tiên!" />
      ) : categoriesView === 'card' ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCategories.items.map((cat) => (
              <div
                key={cat.id}
                className="group relative flex flex-col gap-4 rounded border border-border bg-background p-5 transition-all hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-white shadow-sm"
                      style={{ backgroundColor: cat.colorHex }}
                    >
                      <CategoryIcon name={cat.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <TruncatedName name={cat.name} as="h4" className="text-sm font-bold text-ink-900" />
                      <span className="font-mono text-xs text-muted-foreground">ID: {cat.id}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => openCategoryDialog(cat)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary-600"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Xoá"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                  <span className="text-muted-foreground">
                    Thứ tự: <span className="font-bold text-foreground">{cat.id}</span>
                  </span>
                  <StatusBadge status="active" />
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedCategories.activePage}
            totalPages={paginatedCategories.totalPages}
            totalCount={paginatedCategories.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setCategoriesPage}
            itemLabel="danh mục"
          />
        </>
      ) : (
        <div className="overflow-hidden rounded border border-border bg-background">
          <div className="grid grid-cols-12 bg-muted px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-6">Danh mục</span>
            <span className="col-span-3">Thứ tự</span>
            <span className="col-span-3 text-right">Hành động</span>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedCategories.items.map((cat) => (
              <div key={cat.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50">
                <div className="col-span-6 flex min-w-0 items-center gap-3 pr-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-white"
                    style={{ backgroundColor: cat.colorHex }}
                  >
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                  </div>
                  <TruncatedName name={cat.name} className="text-sm text-ink-900" />
                </div>
                <div className="col-span-3 text-sm text-muted-foreground">{cat.id}</div>
                <div className="col-span-3 flex justify-end gap-1.5">
                  <button type="button" onClick={() => openCategoryDialog(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-primary-50 hover:text-primary-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDeleteCategory(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedCategories.activePage}
            totalPages={paginatedCategories.totalPages}
            totalCount={paginatedCategories.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setCategoriesPage}
            itemLabel="danh mục"
            bordered
          />
        </div>
      )}

      <Modal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        title={selectedCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        description="Nhập các thông tin cơ bản cho danh mục"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowCategoryModal(false)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="cat-form" loading={creatingCategory || updatingCategory} className="flex-1 text-xs font-bold">
              Lưu lại
            </Button>
          </>
        }
      >
        <form id="cat-form" onSubmit={handleSaveCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm">Tên danh mục <span className="text-red-500">*</span></label>
            <LimitedTextInput
              value={catName}
              onValueChange={setCatName}
              maxLength={CATEGORY_NAME_MAX}
              placeholder="VD: Tiếng Anh Giao Tiếp"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-sm ">
              Màu đại diện
              <span className="font-mono text-xs uppercase text-muted-foreground">{catColor}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatColor(c)}
                  className={`h-7 w-7 rounded-full border transition-all ${
                    catColor === c ? 'scale-110 ring-2 ring-primary-500 ring-offset-2' : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="h-8 w-8 cursor-pointer border border-border p-0 rounded overflow-hidden shrink-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm ">Icon hiển thị</label>
            <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto rounded-[8px] border border-border bg-muted p-2.5">
              {AVAILABLE_ICONS.map((i) => {
                const isSelected = catIcon === i.name
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setCatIcon(i.name)}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded border text-xs transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-500 text-white shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CategoryIcon name={i.name} className="h-4 w-4" />
                    <span className="max-w-full truncate px-1 text-xs">{i.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm ">Thứ tự ưu tiên (Sort order)</label>
            <Input
              type="number"
              min="1"
              value={catSort}
              onChange={(e) => setCatSort(Number(e.target.value))}
            />
          </div>
        </form>
      </Modal>

      {confirmDialog}
    </div>
  )
}

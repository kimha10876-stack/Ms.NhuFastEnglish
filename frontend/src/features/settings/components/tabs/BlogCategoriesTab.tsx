import { useState } from 'react'
import { Edit2, Trash2, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Modal, EmptyState, LoadingState, Pagination } from '@/shared/components'
import { SettingsCollectionHeader } from '../SettingsCollectionHeader'
import { LimitedTextInput } from '../LimitedTextInput'
import { TruncatedName } from '../TruncatedName'
import { CATEGORY_NAME_MAX, SETTINGS_PAGE_SIZE, type SettingsViewMode } from '../../settings.constants'
import { paginateItems } from '../../utils/paginate'
import {
  useBlogCategories, useCreateBlogCategory,
  useUpdateBlogCategory, useDeleteBlogCategory,
} from '@/features/blog/useBlog'
import type { BlogCategory } from '@/features/blog/blog.types'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { toast } from '@/shared/utils/toast'

export function BlogCategoriesTab() {
  const { ask, close, setLoading, confirmDialog } = useConfirmDialog()
  const { data: blogCats = [], isLoading: loadingBlogCats } = useBlogCategories()
  const { mutate: createBlogCat, isPending: creatingBlogCat } = useCreateBlogCategory()
  const { mutate: updateBlogCat, isPending: updatingBlogCat } = useUpdateBlogCategory()
  const { mutate: deleteBlogCat } = useDeleteBlogCategory()

  const [showBlogCatModal, setShowBlogCatModal] = useState(false)
  const [selectedBlogCat, setSelectedBlogCat] = useState<BlogCategory | null>(null)
  const [blogCatName, setBlogCatName] = useState('')
  const [blogCatSort, setBlogCatSort] = useState(1)
  const [blogCatsView, setBlogCatsView] = useState<SettingsViewMode>('card')
  const [blogCatsPage, setBlogCatsPage] = useState(1)

  const paginatedBlogCats = paginateItems(blogCats, blogCatsPage, SETTINGS_PAGE_SIZE)

  const openBlogCatDialog = (cat: BlogCategory | null) => {
    if (cat) {
      setSelectedBlogCat(cat)
      setBlogCatName(cat.name)
      setBlogCatSort(cat.sortOrder)
    } else {
      setSelectedBlogCat(null)
      setBlogCatName('')
      setBlogCatSort(blogCats.length + 1)
    }
    setShowBlogCatModal(true)
  }

  const handleSaveBlogCat = (e: React.FormEvent) => {
    e.preventDefault()

    if (!blogCatName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }
    if (blogCatName.length > CATEGORY_NAME_MAX) {
      toast.error(`Tên danh mục tối đa ${CATEGORY_NAME_MAX} ký tự`)
      return
    }

    const payload = {
      name: blogCatName.trim(),
      sortOrder: Number(blogCatSort),
    }

    if (selectedBlogCat) {
      updateBlogCat(
        { id: selectedBlogCat.id, body: payload },
        {
          onSuccess: () => {
            setShowBlogCatModal(false)
            toast.success('Cập nhật danh mục bài viết thành công!')
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Cập nhật danh mục thất bại')
          },
        }
      )
    } else {
      createBlogCat(payload, {
        onSuccess: () => {
          setShowBlogCatModal(false)
          toast.success('Thêm danh mục bài viết thành công!')
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          toast.error(msg || 'Tạo danh mục thất bại')
        },
      })
    }
  }

  const handleDeleteBlogCat = (cat: BlogCategory) => {
    ask({
      title: 'Xóa danh mục bài viết',
      description: `Bạn có chắc muốn xoá danh mục "${cat.name}"? Xóa danh mục sẽ gỡ phân loại của tất cả bài viết liên quan.`,
      confirmLabel: 'Xóa',
      onConfirm: () => {
        setLoading(true)
        deleteBlogCat(cat.id, {
          onSuccess: (res: { message?: string }) => {
            toast.success(res?.message || 'Xóa danh mục bài viết thành công')
            close()
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Xóa danh mục bài viết thất bại')
          },
          onSettled: () => setLoading(false),
        })
      },
    })
  }

  return (
    <div>
      <SettingsCollectionHeader
        title="Danh mục bài viết (Blog)"
        description="Quản lý danh sách các danh mục phân loại cho tin tức và bài đăng"
        addLabel="Thêm danh mục"
        onAdd={() => openBlogCatDialog(null)}
        viewMode={blogCatsView}
        onViewModeChange={(mode) => {
          setBlogCatsView(mode)
          setBlogCatsPage(1)
        }}
      />

      {loadingBlogCats ? (
        <LoadingState variant={blogCatsView === 'card' ? 'skeleton-cards' : 'skeleton-rows'} rows={3} />
      ) : blogCats.length === 0 ? (
        <EmptyState title="Không tìm thấy danh mục bài viết nào" description="Hãy tạo danh mục bài viết đầu tiên!" />
      ) : blogCatsView === 'card' ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedBlogCats.items.map((cat) => (
              <div
                key={cat.id}
                className="group relative flex flex-col gap-4 rounded border border-border bg-background p-5 transition-all hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-50 text-primary-600 shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <TruncatedName name={cat.name} as="h4" className="text-sm font-bold text-ink-900" />
                      <TruncatedName name={`Slug: ${cat.slug}`} className="font-mono text-xs text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => openBlogCatDialog(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-primary-50 hover:text-primary-600" title="Chỉnh sửa">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDeleteBlogCat(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600" title="Xoá">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                  <span className="text-muted-foreground">
                    Thứ tự: <span className="font-bold text-foreground">{cat.sortOrder}</span>
                  </span>
                  <span className="rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-700">
                    Blog
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedBlogCats.activePage}
            totalPages={paginatedBlogCats.totalPages}
            totalCount={paginatedBlogCats.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setBlogCatsPage}
            itemLabel="danh mục"
          />
        </>
      ) : (
        <div className="overflow-hidden rounded border border-border bg-background">
          <div className="grid grid-cols-12 bg-muted px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Danh mục</span>
            <span className="col-span-3">Slug</span>
            <span className="col-span-2">Thứ tự</span>
            <span className="col-span-2 text-right">Hành động</span>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedBlogCats.items.map((cat) => (
              <div key={cat.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50">
                <div className="col-span-5 min-w-0 pr-4">
                  <TruncatedName name={cat.name} className="text-sm text-ink-900" />
                </div>
                <div className="col-span-3 min-w-0 pr-4">
                  <TruncatedName name={cat.slug} className="font-mono text-xs text-muted-foreground" />
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">{cat.sortOrder}</div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <button type="button" onClick={() => openBlogCatDialog(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-primary-50 hover:text-primary-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDeleteBlogCat(cat)} className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedBlogCats.activePage}
            totalPages={paginatedBlogCats.totalPages}
            totalCount={paginatedBlogCats.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setBlogCatsPage}
            itemLabel="danh mục"
            bordered
          />
        </div>
      )}

      <Modal
        open={showBlogCatModal}
        onOpenChange={setShowBlogCatModal}
        title={selectedBlogCat ? 'Sửa danh mục bài viết' : 'Thêm danh mục bài viết'}
        description="Nhập thông tin cơ bản cho danh mục phân loại blog"
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowBlogCatModal(false)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="blog-cat-form" loading={creatingBlogCat || updatingBlogCat} className="flex-1 text-xs font-bold">
              Lưu lại
            </Button>
          </>
        }
      >
        <form id="blog-cat-form" onSubmit={handleSaveBlogCat} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm">Tên danh mục <span className="text-red-500">*</span></label>
            <LimitedTextInput
              value={blogCatName}
              onValueChange={setBlogCatName}
              maxLength={CATEGORY_NAME_MAX}
              placeholder="VD: Hướng dẫn IELTS, Thông báo..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm ">Thứ tự sắp xếp hiển thị</label>
            <Input
              type="number"
              value={blogCatSort}
              onChange={(e) => setBlogCatSort(Number(e.target.value))}
              placeholder="VD: 1, 2, 3..."
            />
          </div>
        </form>
      </Modal>

      {confirmDialog}
    </div>
  )
}

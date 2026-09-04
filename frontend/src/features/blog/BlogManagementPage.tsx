import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  FolderOpen,
  Calendar,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import {
  useAdminBlogPosts,
  useBlogCategories,
  useDeleteBlogPost,
} from './useBlog'
import type { BlogPost } from './blog.types'
import {
  ScrollablePageLayout,
  PageHeader,
  EmptyState,
  LoadingState,
  SearchInput,
  Pagination,
  StatusBadge,
  DataTable,
  ConfirmDialog,
  type DataTableColumn,
} from '@/shared/components'
import { toast } from '@/shared/utils/toast'
import { getApiErrorMessage } from '@/shared/utils/upload'

function getPostColumns(handlers: {
  onEdit: (post: BlogPost) => void
  onDelete: (post: BlogPost) => void
}): DataTableColumn<BlogPost>[] {
  return [
    {
      key: 'title',
      header: 'Bài viết',
      className: 'px-5 py-3.5',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-50">
                <FileText className="h-4 w-4 text-primary-500" />
              </div>
            )}
          </div>
          <div className="max-w-xs md:max-w-md">
            <p className="line-clamp-1 cursor-pointer font-semibold text-ink-900 hover:underline">
              {post.title}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{post.summary}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      className: 'whitespace-nowrap px-5 py-3.5',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) =>
        post.categoryName ? (
          <span className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {post.categoryName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Chưa phân loại</span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'whitespace-nowrap px-5 py-3.5',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) => (
        <StatusBadge
          status={post.isPublished ? 'published' : 'draft'}
          label={post.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
        />
      ),
    },
    {
      key: 'viewCount',
      header: 'Lượt xem',
      className: 'whitespace-nowrap px-5 py-3.5 font-medium text-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) => post.viewCount.toLocaleString(),
    },
    {
      key: 'author',
      header: 'Tác giả',
      className: 'whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) => post.authorName,
    },
    {
      key: 'createdAt',
      header: 'Ngày đăng',
      className: 'whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground',
      headerClassName: 'px-5 py-3 text-left',
      render: (post) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'px-5 py-3.5 text-right',
      headerClassName: 'px-5 py-3 text-right',
      render: (post) => (
        <div className="flex justify-end gap-1.5">
          {post.isPublished && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900"
              title="Xem thử"
            >
              <Eye className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => handlers.onEdit(post)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900"
            title="Sửa bài viết"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handlers.onDelete(post)}
            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            title="Xóa bài viết"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]
}

export default function BlogManagementPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<number | ''>('')
  const [pubFilter, setPubFilter] = useState<boolean | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  const { data: postsData, isLoading: loadingPosts } = useAdminBlogPosts({
    search,
    categoryId: catFilter === '' ? undefined : catFilter,
    isPublished: pubFilter === '' ? undefined : pubFilter,
    page,
    pageSize,
  })

  const { data: categories = [] } = useBlogCategories()

  const deletePostMutation = useDeleteBlogPost()

  const handleOpenAddPost = () => {
    navigate('/blog-management/editor')
  }

  const handleOpenEditPost = (post: BlogPost) => {
    navigate(`/blog-management/editor/${post.id}`)
  }

  const handleOpenDeletePost = (post: BlogPost) => {
    setSelectedPost(post)
    setShowDeleteConfirm(true)
  }

  const handleDeletePost = () => {
    if (!selectedPost) return
    deletePostMutation.mutate(selectedPost.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        setSelectedPost(null)
        toast.success('Xóa bài viết thành công')
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, 'Xóa bài viết thất bại'))
      },
    })
  }

  const posts = postsData?.items ?? []
  const totalCount = postsData?.totalCount ?? 0
  const totalPages = postsData?.totalPages ?? 1

  const columns = getPostColumns({
    onEdit: handleOpenEditPost,
    onDelete: handleOpenDeletePost,
  })

  const categoryOptions = [
    { id: '', name: 'Tất cả danh mục' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ]

  const statusOptions = [
    { id: '', name: 'Tất cả trạng thái' },
    { id: 'true', name: 'Đã xuất bản' },
    { id: 'false', name: 'Bản nháp' },
  ]

  const hasFilters = !!(search || catFilter !== '' || pubFilter !== '')

  const resetFilters = () => {
    setSearch('')
    setCatFilter('')
    setPubFilter('')
    setPage(1)
  }

  return (
    <>
    <ScrollablePageLayout
      header={
        <>
          <PageHeader
            eyebrow="Quản lý bài đăng"
            title="Tin tức & Blog"
            icon={FileText}
            actions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/settings?tab=blog-categories')}
                  className="h-9 gap-1.5 rounded border-primary-300 font-semibold text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                >
                  <FolderOpen className="h-4 w-4 text-primary-600" />
                  Quản lý danh mục
                </Button>
                <Button
                  type="button"
                  onClick={handleOpenAddPost}
                  className="h-9 gap-1.5 rounded bg-primary-500 font-semibold text-ink-900 hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4" />
                  Viết bài mới
                </Button>
              </>
            }
          />

          <div className="flex flex-col gap-3 rounded border border-border bg-background p-4 shadow-sm xl:flex-row xl:items-center">
            <div className="min-w-0 flex-1">
              <SearchInput
                placeholder="Tìm theo tiêu đề hoặc tóm tắt..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                onClear={() => setSearch('')}
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="w-44 shrink-0">
                <CustomDropdown
                  value={catFilter}
                  options={categoryOptions}
                  onChange={(val) => {
                    setCatFilter(val === '' ? '' : Number(val))
                    setPage(1)
                  }}
                />
              </div>

              <div className="w-44 shrink-0">
                <CustomDropdown
                  value={pubFilter === '' ? '' : pubFilter ? 'true' : 'false'}
                  options={statusOptions}
                  onChange={(val) => {
                    setPubFilter(val === '' ? '' : val === 'true')
                    setPage(1)
                  }}
                />
              </div>

              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-9 shrink-0 rounded border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-ink-900"
                >
                  Đặt lại
                </Button>
              )}
            </div>
          </div>
        </>
      }
    >
      {loadingPosts ? (
        <LoadingState variant="skeleton-table" />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không có bài viết nào"
          description="Không tìm thấy bài viết nào phù hợp với bộ lọc tìm kiếm."
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters} className="rounded text-xs font-bold">
                Xóa bộ lọc
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col overflow-hidden">
          <DataTable columns={columns} data={posts} keyExtractor={(post) => post.id} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="bài viết"
            bordered
          />
        </div>
      )}
    </ScrollablePageLayout>

      <ConfirmDialog
        open={showDeleteConfirm && !!selectedPost}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa bài viết?"
        description={
          <>
            Bạn có chắc chắn muốn xóa bài viết{' '}
            <strong className="text-foreground">{selectedPost?.title}</strong>? Hành động này không thể hoàn tác.
          </>
        }
        cancelLabel="Huỷ"
        confirmLabel="Xóa bài viết"
        onConfirm={handleDeletePost}
        loading={deletePostMutation.isPending}
        variant="destructive"
      />
    </>
  )
}

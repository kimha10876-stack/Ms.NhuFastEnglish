import { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FolderOpen,
  Calendar,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  useAdminBlogPosts,
  useBlogCategories,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useCreateBlogCategory,
  useUpdateBlogCategory,
  useDeleteBlogCategory,
} from './useBlog'
import { RichTextEditor } from '@/shared/components/ui/RichTextEditor'
import type { BlogPost, BlogCategory } from './blog.types'

export default function BlogManagementPage() {
  // Tabs and view states
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<number | ''>('')
  const [pubFilter, setPubFilter] = useState<boolean | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Modals / forms
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  
  // Post form state
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [categoryId, setCategoryId] = useState<number | ''>('')

  // Category management modal
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatSortOrder, setNewCatSortOrder] = useState(0)
  const [editingCatId, setEditingCatId] = useState<number | null>(null)

  // API hooks
  const { data: postsData, isLoading: loadingPosts } = useAdminBlogPosts({
    search,
    categoryId: catFilter === '' ? undefined : catFilter,
    isPublished: pubFilter === '' ? undefined : pubFilter,
    page,
    pageSize,
  })

  const { data: categories = [], isLoading: loadingCats } = useBlogCategories()

  const createPostMutation = useCreateBlogPost()
  const updatePostMutation = useUpdateBlogPost(selectedPost?.id ?? '')
  const deletePostMutation = useDeleteBlogPost()

  const createCatMutation = useCreateBlogCategory()
  const updateCatMutation = useUpdateBlogCategory()
  const deleteCatMutation = useDeleteBlogCategory()

  // Actions
  const handleOpenAddPost = () => {
    setSelectedPost(null)
    setTitle('')
    setThumbnailUrl('')
    setSummary('')
    setContent('')
    setIsPublished(false)
    setCategoryId(categories.length > 0 ? categories[0].id : '')
    setShowPostModal(true)
  }

  const handleOpenEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setTitle(post.title)
    setThumbnailUrl(post.thumbnailUrl || '')
    setSummary(post.summary)
    setContent(post.content)
    setIsPublished(post.isPublished)
    setCategoryId(post.categoryId ?? '')
    setShowPostModal(true)
  }

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !content.trim()) return

    const payload = {
      title: title.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      summary: summary.trim(),
      content: content.trim(),
      isPublished,
      categoryId: categoryId === '' ? undefined : Number(categoryId),
    }

    const callbacks = {
      onSuccess: () => {
        setShowPostModal(false)
      },
    }

    if (selectedPost) {
      updatePostMutation.mutate(payload, callbacks)
    } else {
      createPostMutation.mutate(payload, callbacks)
    }
  }

  const handleDeletePost = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      deletePostMutation.mutate(id)
    }
  }

  // Category Actions
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const payload = {
      name: newCatName.trim(),
      sortOrder: Number(newCatSortOrder),
    }

    const callbacks = {
      onSuccess: () => {
        setNewCatName('')
        setNewCatSortOrder(0)
        setEditingCatId(null)
      },
    }

    if (editingCatId) {
      updateCatMutation.mutate({ id: editingCatId, body: payload }, callbacks)
    } else {
      createCatMutation.mutate(payload, callbacks)
    }
  }

  const handleEditCatClick = (cat: BlogCategory) => {
    setEditingCatId(cat.id)
    setNewCatName(cat.name)
    setNewCatSortOrder(cat.sortOrder)
  }

  const handleDeleteCat = (id: number) => {
    if (confirm('Xóa danh mục này sẽ gỡ phân loại của tất cả bài viết liên quan. Bạn chắc chắn chứ?')) {
      deleteCatMutation.mutate(id)
    }
  }

  const posts = postsData?.items ?? []
  const totalCount = postsData?.totalCount ?? 0
  const totalPages = postsData?.totalPages ?? 1

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Quản lý bài đăng</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-500" />
            Tin tức & Blog
          </h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCatModal(true)}
            className="rounded-xl flex items-center gap-1.5 h-[38px] text-gray-700 font-medium"
          >
            <FolderOpen className="h-4 w-4 text-gray-400" />
            Quản lý danh mục
          </Button>
          <Button
            type="button"
            onClick={handleOpenAddPost}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-xl flex items-center gap-1.5 h-[38px]"
          >
            <Plus className="h-4 w-4" />
            Viết bài mới
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tiêu đề hoặc tóm tắt..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 h-[38px] rounded-xl border-gray-200"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 h-[38px]">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value === '' ? '' : Number(e.target.value))
                setPage(1)
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none text-gray-700 cursor-pointer pr-4"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 h-[38px]">
            <select
              value={pubFilter === '' ? '' : pubFilter ? 'true' : 'false'}
              onChange={(e) => {
                setPubFilter(e.target.value === '' ? '' : e.target.value === 'true')
                setPage(1)
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none text-gray-700 cursor-pointer pr-4"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đã xuất bản</option>
              <option value="false">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of posts or Table */}
      {loadingPosts ? (
        <div className="flex justify-center items-center py-20 bg-white border rounded-2xl">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-900">Không có bài viết nào</h3>
          <p className="text-xs text-gray-500 mt-1">
            Không tìm thấy bài viết nào phù hợp với bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Bài viết</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Danh mục</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Lượt xem</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Tác giả</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Ngày đăng</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title & Thumbnail */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {post.thumbnailUrl ? (
                            <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-50">
                              <FileText className="h-4 w-4 text-amber-500" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs md:max-w-md">
                          <p className="font-semibold text-gray-900 line-clamp-1 hover:underline cursor-pointer">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">{post.summary}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      {post.categoryName ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {post.categoryName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Chưa phân loại</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {post.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          <XCircle className="h-3.5 w-3.5" />
                          Bản nháp
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="px-5 py-3.5 font-medium text-gray-700">
                      {post.viewCount.toLocaleString()}
                    </td>

                    {/* Author */}
                    <td className="px-5 py-3.5 text-gray-600 text-xs">
                      {post.authorName}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-gray-600 text-xs flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {post.isPublished && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Xem thử"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditPost(post)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                          title="Sửa bài viết"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm text-xs font-semibold text-gray-500">
              <span>
                Hiển thị từ <span className="text-gray-900">{((page - 1) * pageSize) + 1}</span> đến{' '}
                <span className="text-gray-900">{Math.min(page * pageSize, totalCount)}</span> trên{' '}
                <span className="text-gray-900">{totalCount}</span> bài viết
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg text-xs"
                >
                  Trước
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`w-7 h-7 rounded-lg border font-semibold flex items-center justify-center transition-colors ${
                        page === idx + 1
                          ? 'bg-amber-500 border-amber-500 text-gray-900'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-lg text-xs"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT POST MODAL ────────────────────────────────────── */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 text-base">
                  {selectedPost ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Soạn thảo và thiết kế nội dung bài viết tin tức</p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handlePostSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="VD: Bí quyết nhớ 100 từ vựng mỗi ngày..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Danh mục bài viết</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-[38px] px-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-amber-500"
                  >
                    <option value="">Chưa phân loại</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover image (Thumbnail Url) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Ảnh bìa (Thumbnail URL)</label>
                <Input
                  placeholder="https://images.unsplash.com/photo-1546410531-bb4caa6b424d"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Dán link ảnh chất lượng cao để làm ảnh bìa bài viết.</p>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Tóm tắt ngắn gọn <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Mô tả ngắn gọn nội dung cốt lõi của bài viết..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Content Editor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Nội dung bài viết <span className="text-red-500">*</span></label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-chk"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="pub-chk" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                  Xuất bản ngay (Mọi người có thể đọc)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl font-bold text-xs px-5 h-[38px]"
                  onClick={() => setShowPostModal(false)}
                >
                  Huỷ bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs rounded-xl px-6 h-[38px] flex items-center gap-1.5"
                >
                  {(createPostMutation.isPending || updatePostMutation.isPending) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Lưu bài viết
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CATEGORY MANAGEMENT MODAL ──────────────────────────────────── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Quản lý danh mục bài viết</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Thêm, sửa hoặc xóa các phân loại cho blog</p>
              </div>
              <button
                onClick={() => {
                  setShowCatModal(false)
                  setEditingCatId(null)
                  setNewCatName('')
                  setNewCatSortOrder(0)
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              {/* Category creation / edit form */}
              <form onSubmit={handleCatSubmit} className="bg-gray-50 p-4 border rounded-xl space-y-3">
                <p className="text-xs font-bold text-gray-800">
                  {editingCatId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Tên danh mục (VD: Hướng dẫn học)..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    className="h-[36px] bg-white border-gray-200"
                  />
                  <div className="flex gap-2.5 items-center">
                    <span className="text-xs text-gray-500 font-semibold shrink-0">Thứ tự hiển thị:</span>
                    <Input
                      type="number"
                      value={newCatSortOrder}
                      onChange={(e) => setNewCatSortOrder(Number(e.target.value))}
                      className="w-20 h-[36px] bg-white border-gray-200 text-center"
                    />
                    <div className="flex-1 flex justify-end gap-1.5">
                      {editingCatId && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditingCatId(null)
                            setNewCatName('')
                            setNewCatSortOrder(0)
                          }}
                          className="h-[36px] rounded-lg text-xs"
                        >
                          Hủy
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={createCatMutation.isPending || updateCatMutation.isPending}
                        className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs h-[36px] rounded-lg"
                      >
                        Lưu
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Categories list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-700">Danh mục hiện có</p>
                {loadingCats ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chưa có danh mục nào.</p>
                ) : (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
                    {categories.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {c.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Slug: {c.slug} · Sắp xếp: {c.sortOrder}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditCatClick(c)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCat(c.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

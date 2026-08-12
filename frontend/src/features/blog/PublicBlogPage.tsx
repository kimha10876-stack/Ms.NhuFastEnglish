import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Eye,
  User,
  ArrowRight,
  Loader2,
  Folder,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBlogPosts, useBlogCategories } from './useBlog'
import { useAuthStore } from '@/features/auth/auth.store'

export default function PublicBlogPage() {
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 9

  const { data: categories = [] } = useBlogCategories()
  const { data: postsData, isLoading: loadingPosts } = useBlogPosts({
    categorySlug: selectedCatSlug || undefined,
    page,
    pageSize,
  })

  const posts = postsData?.items ?? []
  const totalPages = postsData?.totalPages ?? 1

  const handleSelectCategory = (slug: string) => {
    setSelectedCatSlug(slug)
    setPage(1)
  }

  const user = useAuthStore((s) => s.user)
  const isStudent = user?.roles.includes('Student') ?? false

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06] shrink-0">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-gray-900" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-gray-900">Ms Nhu Fast English</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="rounded-xl font-semibold border-amber-500/30 text-amber-700 hover:bg-amber-50">
                  {isStudent ? 'Vào lớp học' : 'Trang quản lý'}
                </Button>
              </Link>
            )}
            <Link to="/">
              <Button size="sm" variant="ghost" className="rounded-xl font-semibold">
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50 px-5 py-12 md:py-16 text-center border-b border-gray-200">
        <div className="max-w-xl mx-auto">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Blog Chia sẻ
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3 text-balance">
            Kinh nghiệm học & Tin tức
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed text-balance">
            Nơi tổng hợp những kiến thức bổ ích, kinh nghiệm luyện thi IELTS, 
            giao tiếp tự nhiên và các thông báo mới nhất từ trung tâm.
          </p>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto px-5 py-8 w-full space-y-6">
        
        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          <button
            onClick={() => handleSelectCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              selectedCatSlug === ''
                ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
          >
            Tất cả bài viết
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                selectedCatSlug === cat.slug
                  ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loadingPosts ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
            <Folder className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Không tìm thấy bài viết</h3>
            <p className="text-xs text-gray-500 mt-1">
              Chưa có bài đăng nào thuộc danh mục này. Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  {/* Image cover */}
                  <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] bg-gray-100 overflow-hidden relative">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50/50">
                        <BookOpen className="h-8 w-8 text-amber-500/60" />
                      </div>
                    )}
                    {post.categoryName && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {post.categoryName}
                      </span>
                    )}
                  </Link>

                  {/* Body info */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-semibold mb-2.5">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                    </div>

                    <Link to={`/blog/${post.slug}`} className="block">
                      <h2 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-base line-clamp-2 leading-snug mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.summary}
                    </p>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors group/btn mt-auto"
                    >
                      Đọc bài viết
                      <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-xl text-xs font-bold"
                >
                  Trước
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    className={`w-8 h-8 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                      page === idx + 1
                        ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-150 text-gray-600 bg-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-xl text-xs font-bold"
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-6 px-5 border-t text-center text-xs text-gray-400 bg-white shrink-0">
        © 2025 Ms Nhu Fast English · Trung tâm Anh ngữ
      </footer>

    </div>
  )
}

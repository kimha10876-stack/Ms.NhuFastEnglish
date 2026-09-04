import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Folder } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBlogPosts, useBlogCategories } from './useBlog'
import {
  PublicBlogLayout,
  CategoryPills,
  BlogPostCard,
} from './components/public'

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

  return (
    <PublicBlogLayout
      mainClassName="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-8"
      banner={
        <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-gray-50 px-5 py-12 text-center md:py-16">
          <div className="mx-auto max-w-xl">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Blog Chia sẻ
            </span>
            <h1 className="mb-3 text-balance text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Kinh nghiệm học & Tin tức
            </h1>
            <p className="text-balance text-sm leading-relaxed text-gray-500 md:text-base">
              Nơi tổng hợp những kiến thức bổ ích, kinh nghiệm luyện thi IELTS, giao tiếp tự nhiên và các
              thông báo mới nhất từ trung tâm.
            </p>
          </div>
        </section>
      }
      secondaryNav={
        <Link to="/">
          <Button size="sm" variant="ghost" className="rounded-xl font-semibold">
            Quay lại trang chủ
          </Button>
        </Link>
      }
    >
      <CategoryPills
        categories={categories}
        selectedSlug={selectedCatSlug}
        onSelect={handleSelectCategory}
      />

      {loadingPosts ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
          <Folder className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="font-semibold text-gray-900">Không tìm thấy bài viết</h3>
          <p className="mt-1 text-xs text-gray-500">
            Chưa có bài đăng nào thuộc danh mục này. Vui lòng quay lại sau!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

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
                  type="button"
                  onClick={() => setPage(idx + 1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                    page === idx + 1
                      ? 'border-amber-500 bg-amber-500 text-gray-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-200'
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
    </PublicBlogLayout>
  )
}

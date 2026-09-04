import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, User, Loader2, Folder } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBlogPostDetail } from './useBlog'
import { PublicBlogLayout, BlogArticleBody } from './components/public'

export default function BlogPostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPostDetail(slug)

  return (
    <PublicBlogLayout
      mainClassName="mx-auto w-full max-w-3xl flex-1 px-5 py-8"
      secondaryNav={
        <Link to="/blog">
          <Button size="sm" variant="ghost" className="flex items-center gap-1 rounded-xl font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            Tất cả bài viết
          </Button>
        </Link>
      }
    >
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-500">Đang tải nội dung bài viết...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
          <Folder className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h3 className="font-semibold text-gray-900">Không tìm thấy bài viết</h3>
          <p className="mb-6 mt-1 text-xs text-gray-500">
            Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
          </p>
          <Link to="/blog">
            <Button className="h-[38px] rounded-xl bg-amber-500 px-5 text-xs font-bold text-gray-900 hover:bg-amber-600">
              Quay lại trang Blog
            </Button>
          </Link>
        </div>
      )}

      {post && (
        <article className="space-y-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          {post.categoryName && (
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {post.categoryName}
            </span>
          )}

          <h1 className="text-2xl font-extrabold leading-tight text-gray-900 md:text-3xl">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 border-y border-gray-100 py-3.5 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gray-400" />
              Đăng bởi: <strong className="text-gray-700">{post.authorName}</strong>
            </span>
            <span className="hidden h-3 w-[1px] bg-gray-300 sm:inline" />
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              Ngày đăng:{' '}
              <strong className="text-gray-700">
                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
              </strong>
            </span>
            <span className="hidden h-3 w-[1px] bg-gray-300 sm:inline" />
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-gray-400" />
              Lượt xem: <strong className="text-gray-700">{post.viewCount}</strong>
            </span>
          </div>

          <div className="rounded-r-xl border-l-4 border-amber-500 bg-gray-50 p-4">
            <p className="text-sm font-semibold italic leading-relaxed text-gray-700">
              &ldquo;{post.summary}&rdquo;
            </p>
          </div>

          <BlogArticleBody html={post.content} variant="public" />
        </article>
      )}
    </PublicBlogLayout>
  )
}

import { useParams, Link } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Loader2,
  Folder,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBlogPostDetail } from './useBlog'

export default function BlogPostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPostDetail(slug)

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06] shrink-0">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-gray-900" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-gray-900">Ms. Nhụ Fast English</span>
          </Link>
          <Link to="/blog">
            <Button size="sm" variant="outline" className="rounded-xl font-semibold flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Tất cả bài viết
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto px-5 py-8 w-full">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Đang tải nội dung bài viết...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
            <Folder className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Không tìm thấy bài viết</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
            </p>
            <Link to="/blog">
              <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl text-xs px-5 h-[38px]">
                Quay lại trang Blog
              </Button>
            </Link>
          </div>
        )}

        {/* Post Detail */}
        {post && (
          <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-10 space-y-6">
            
            {/* Category tag */}
            {post.categoryName && (
              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {post.categoryName}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold border-y border-gray-100 py-3.5">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-gray-400" />
                Đăng bởi: <strong className="text-gray-700">{post.authorName}</strong>
              </span>
              <span className="h-3 w-[1px] bg-gray-300 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                Ngày đăng: <strong className="text-gray-700">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</strong>
              </span>
              <span className="h-3 w-[1px] bg-gray-300 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-gray-400" />
                Lượt xem: <strong className="text-gray-700">{post.viewCount}</strong>
              </span>
            </div>



            {/* Summary Block */}
            <div className="bg-gray-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <p className="text-sm font-semibold italic text-gray-700 leading-relaxed">
                "{post.summary}"
              </p>
            </div>

            {/* Article Content Render */}
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-gray-800 leading-relaxed text-[15px] space-y-4 pt-4 border-t border-gray-100
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-gray-900
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900
                [&_p]:text-gray-700 [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
                [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-6 [&_img]:border [&_img]:border-gray-150 [&_img]:shadow-sm
                [&_a]:text-amber-600 [&_a]:underline [&_a]:hover:text-amber-700"
            />

          </article>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-6 px-5 border-t text-center text-xs text-gray-400 bg-white shrink-0">
        © 2025 Ms. Nhụ Fast English · Trung tâm Anh ngữ
      </footer>

    </div>
  )
}

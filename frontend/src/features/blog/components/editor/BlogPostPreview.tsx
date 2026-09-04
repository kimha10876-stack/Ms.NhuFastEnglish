import { Eye, Calendar, User } from 'lucide-react'
import type { BlogCategory } from '../../blog.types'
import { BlogArticleBody } from '../public/BlogArticleBody'

interface BlogPostPreviewProps {
  title: string
  summary: string
  thumbnailUrl: string
  contentHtml: string
  categoryId: number | ''
  categories: BlogCategory[]
  authorName?: string
  viewCount?: number
}

export function BlogPostPreview({
  title,
  summary,
  thumbnailUrl,
  contentHtml,
  categoryId,
  categories,
  authorName,
  viewCount = 0,
}: BlogPostPreviewProps) {
  const categoryName = categoryId
    ? categories.find((c) => c.id === Number(categoryId))?.name
    : undefined

  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-muted px-5 py-8">
      <div className="flex w-full max-w-[800px] flex-col space-y-6">
        <div className="flex shrink-0 items-center justify-between rounded border border-primary-200 bg-primary-100 px-4 py-2.5 text-xs font-semibold text-primary-800 shadow-sm">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            Bạn đang xem bản hiển thị trước (Live Preview). Đây là giao diện chính xác mà học viên sẽ thấy khi
            đọc bài viết này trên trang public.
          </span>
        </div>

        <article className="space-y-6 overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-sm md:p-12">
          {categoryName ? (
            <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-800">
              {categoryName}
            </span>
          ) : (
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chưa phân loại
            </span>
          )}

          <h1 className="text-2xl font-extrabold leading-tight text-ink-900 md:text-3.5xl">
            {title || 'Tiêu đề bài viết của bạn sẽ hiển thị ở đây'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 border-y border-border py-3.5 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              Đăng bởi: <strong className="text-foreground">{authorName || 'Tác giả của bạn'}</strong>
            </span>
            <span className="hidden h-3 w-[1px] bg-gray-300 sm:inline" />
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Ngày đăng: <strong className="text-foreground">{new Date().toLocaleDateString('vi-VN')}</strong>
            </span>
            <span className="hidden h-3 w-[1px] bg-gray-300 sm:inline" />
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Lượt xem: <strong className="text-foreground">{viewCount}</strong>
            </span>
          </div>

          {thumbnailUrl.trim() && (
            <div className="aspect-[16/9] overflow-hidden rounded border bg-muted shadow-sm">
              <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          {summary.trim() && (
            <div className="rounded-r-xl border-l-4 border-primary-500 bg-muted p-4">
              <p className="text-sm font-semibold italic leading-relaxed text-foreground">&ldquo;{summary}&rdquo;</p>
            </div>
          )}

          <BlogArticleBody html={contentHtml} variant="admin" />
        </article>
      </div>
    </div>
  )
}

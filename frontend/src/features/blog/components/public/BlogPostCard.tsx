import { Link } from 'react-router-dom'
import { BookOpen, Calendar, Eye, User, ArrowRight } from 'lucide-react'
import type { BlogPost } from '../../blog.types'

interface BlogPostCardProps {
  post: BlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">
      <Link to={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-gray-100">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-amber-50/50">
            <BookOpen className="h-8 w-8 text-amber-500/60" />
          </div>
        )}
        {post.categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">
            {post.categoryName}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex items-center gap-3 text-[11px] font-semibold text-gray-400">
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
          <h2 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-amber-600">
            {post.title}
          </h2>
        </Link>

        <p className="mb-4 line-clamp-3 flex-1 text-xs leading-relaxed text-gray-500">{post.summary}</p>

        <Link
          to={`/blog/${post.slug}`}
          className="group/btn mt-auto inline-flex items-center gap-1 text-xs font-bold text-amber-600 transition-colors hover:text-amber-700"
        >
          Đọc bài viết
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

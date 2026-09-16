import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { LandingLayout } from '@/features/landing/LandingLayout'
import { blogPostsDummy, paginateBlogPosts } from './blog.dummy'
import type { BlogPost } from './blog.types'

const VI_MONTHS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return { day: d.getDate(), month: VI_MONTHS[d.getMonth()] }
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

function PostThumbnail({ post, className }: { post: BlogPost; className?: string }) {
  if (post.thumbnailUrl) {
    return (
      <img
        src={post.thumbnailUrl}
        alt={post.title}
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-primary-50', className)}>
      <BookOpen className="h-6 w-6 text-primary-600/50" />
    </div>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg sm:p-5">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl bg-gray-100">
        <div className="aspect-[16/10] overflow-hidden">
          <PostThumbnail
            post={post}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <h2 className="font-heading text-sm font-extrabold uppercase leading-snug text-[#222222] sm:text-base">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary-700">
            {post.title}
          </Link>
        </h2>
        {post.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{post.summary}</p>
        )}
      </div>
    </article>
  )
}

function GridPostCard({ post }: { post: BlogPost }) {
  const hasImage = !!post.thumbnailUrl

  if (!hasImage) {
    return (
      <article className="group flex h-full flex-col rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg sm:p-5">
        <h2 className="font-heading line-clamp-4 text-xs font-extrabold uppercase leading-snug text-[#222222] sm:text-[13px]">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary-700">
            {post.title}
          </Link>
        </h2>
        {post.summary && (
          <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-gray-600 sm:text-sm">
            {post.summary}
          </p>
        )}
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg sm:p-4">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl bg-gray-100">
        <div className="aspect-[4/3] overflow-hidden">
          <PostThumbnail
            post={post}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <h2 className="font-heading line-clamp-3 text-xs font-extrabold uppercase leading-snug text-[#222222] sm:text-[13px]">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary-700">
            {post.title}
          </Link>
        </h2>
      </div>
    </article>
  )
}

function RecentPostItem({ post }: { post: BlogPost }) {
  const { day, month } = formatShortDate(post.createdAt)

  return (
    <li>
      <Link
        to={`/blog/${post.slug}`}
        className="group flex gap-3 border-b border-gray-100 py-3 last:border-0"
      >
        {post.thumbnailUrl ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <PostThumbnail post={post} />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-center">
            <span className="font-heading text-lg font-extrabold leading-none text-primary-800">{day}</span>
            <span className="font-heading text-[10px] font-bold uppercase text-primary-800">{month}</span>
          </div>
        )}
        <p className="font-heading line-clamp-3 flex-1 text-[11px] font-extrabold uppercase leading-snug text-[#222222] group-hover:text-primary-700 sm:text-xs">
          {post.title}
        </p>
      </Link>
    </li>
  )
}

function BlogPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-6" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        aria-label="Trang trước"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-primary hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={page === p ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
              page === p
                ? 'border-primary bg-primary font-semibold text-[#333333]'
                : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary-800'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages}
        aria-label="Trang sau"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-primary hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export default function PublicBlogPage() {
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Dummy data — thay bằng API blog sau (cùng nguồn newsEventsDummy trên landing)
  const { items: posts, totalPages } = paginateBlogPosts(blogPostsDummy, page, pageSize)
  const recentPosts = blogPostsDummy.slice(0, 8)

  const featuredPosts = page === 1 ? posts.slice(0, 2) : []
  const gridPosts = page === 1 ? posts.slice(2) : posts

  return (
    <LandingLayout>
      <main className="flex-1 bg-[#fef9e7] py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h1 className="font-heading text-[28px] font-extrabold text-[#222222] sm:text-[36px]">
            Tin tức
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
            {/* Main column */}
            <div>
              <div className="space-y-6">
                {featuredPosts.length > 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {featuredPosts.map((post) => (
                      <FeaturedPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {gridPosts.length > 0 && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {gridPosts.map((post) => (
                      <GridPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                <BlogPagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/[0.04]">
                <div className="bg-primary px-4 py-3">
                  <h2 className="font-heading text-sm font-extrabold uppercase tracking-wide text-[#333333]">
                    Bài viết mới nhất
                  </h2>
                </div>
                <div className="px-4">
                  <ul>
                    {recentPosts.map((post) => (
                      <RecentPostItem key={post.id} post={post} />
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </LandingLayout>
  )
}

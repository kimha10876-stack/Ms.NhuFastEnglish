import { Link } from 'react-router-dom'
import { BlogPostThumbnail } from './BlogPostThumbnail'
import type { BlogPost } from '../blog.types'

const VI_MONTHS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return { day: d.getDate(), month: VI_MONTHS[d.getMonth()] }
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
            <BlogPostThumbnail post={post} />
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

export function BlogRecentSidebar({ posts }: { posts: BlogPost[] }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/[0.04]">
        <div className="bg-primary px-4 py-3">
          <h2 className="font-heading text-sm font-extrabold uppercase tracking-wide text-[#333333]">
            Bài viết mới nhất
          </h2>
        </div>
        <div className="px-4">
          <ul>
            {posts.map((post) => (
              <RecentPostItem key={post.id} post={post} />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

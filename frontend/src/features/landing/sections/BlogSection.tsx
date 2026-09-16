import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Mascot } from '../components/Mascot'
import { newsEventsDummy, type NewsEventItem } from '../landing.data'

function NewsCard({
  post,
  featured = false,
}: {
  post: NewsEventItem
  featured?: boolean
}) {
  const href = post.slug ? `/blog/${post.slug}` : '/blog'

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg',
        featured ? 'p-4 sm:p-5' : 'p-3 sm:p-4'
      )}
    >
      {post.image && (
        <Link to={href} className="block overflow-hidden rounded-xl bg-gray-100">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className={cn(
              'w-full object-cover transition-transform duration-300 group-hover:scale-105',
              featured ? 'aspect-[16/10]' : 'aspect-[4/3]'
            )}
          />
        </Link>
      )}

      <div className={cn('flex flex-1 flex-col', post.image ? (featured ? 'mt-4' : 'mt-3') : '')}>
        <h3
          className={cn(
            'font-heading font-extrabold leading-snug text-[#222222]',
            featured
              ? 'text-sm uppercase sm:text-base'
              : 'line-clamp-3 text-xs uppercase sm:text-[13px]'
          )}
        >
          <Link to={href} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>

        {featured && post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
        )}
      </div>
    </article>
  )
}

export function BlogSection() {
  const [featured, ...rest] = newsEventsDummy
  const gridPosts = rest.slice(0, 4)

  return (
    <section id="tin-tuc" className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <h2 className="font-heading text-[28px] font-extrabold text-[#222222] sm:text-[40px]">
              Tin tức
            </h2>
            <Mascot
              name="waveHi"
              className="absolute -right-20 -top-6 hidden w-24 lg:block xl:-right-28 xl:w-28"
            />
          </div>
          <Link
            to="/blog"
            className="font-heading inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-wide text-[#333333] transition-colors hover:bg-primary-400"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
          <NewsCard post={featured} featured />

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {gridPosts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

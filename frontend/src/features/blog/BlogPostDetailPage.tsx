import { useParams, Link } from 'react-router-dom'
import { Folder } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { LandingLayout } from '@/features/landing/LandingLayout'
import { IMAGES } from '@/features/landing/landing.data'
import { useBlogPostDetail } from './useBlog'
import { getBlogPostBySlug, getRecentPosts, getRelatedPosts } from './blog.dummy'
import { RecentPostsSidebar } from './components/RecentPostsSidebar'
import { RelatedPostsSection } from './components/RelatedPostsSection'

const ARTICLE_PROSE = `
  font-body text-[15px] leading-relaxed text-gray-700
  [&_p]:mb-4
  [&_h2]:font-heading [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:text-[#222222] sm:[&_h2]:text-lg
  [&_strong]:font-semibold [&_strong]:text-[#222222]
  [&_figure.blog-inline-image]:my-6 [&_figure.blog-inline-image_img]:w-full [&_figure.blog-inline-image_img]:rounded-lg
  [&_ul.blog-feature-list]:my-4 [&_ul.blog-feature-list]:space-y-2.5 [&_ul.blog-feature-list]:pl-0
  [&_ul.blog-feature-list_li]:relative [&_ul.blog-feature-list_li]:pl-5 [&_ul.blog-feature-list_li]:list-none
  [&_ul.blog-feature-list_li]:before:absolute [&_ul.blog-feature-list_li]:before:left-0 [&_ul.blog-feature-list_li]:before:top-[0.55em]
  [&_ul.blog-feature-list_li]:before:h-2 [&_ul.blog-feature-list_li]:before:w-2 [&_ul.blog-feature-list_li]:before:rotate-45
  [&_ul.blog-feature-list_li]:before:bg-primary [&_ul.blog-feature-list_li]:before:content-['']
  [&_ul.blog-promo-list]:my-4 [&_ul.blog-promo-list]:space-y-2 [&_ul.blog-promo-list]:pl-0
  [&_ul.blog-promo-list_li]:list-none [&_ul.blog-promo-list_li]:pl-0
  [&_img]:max-w-full [&_img]:rounded-lg
  [&_a]:text-primary-700 [&_a]:underline hover:[&_a]:text-primary-800
`

export default function BlogPostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: apiPost } = useBlogPostDetail(slug)

  const dummyPost = getBlogPostBySlug(slug)
  const post = apiPost ?? dummyPost

  const recentPosts = getRecentPosts(8, slug)
  const relatedPosts = getRelatedPosts(slug, 4)
  const heroImage = post?.thumbnailUrl ?? IMAGES.classForeignTeacher
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://msnhufastenglish.com/blog/${slug}`

  return (
    <LandingLayout>
      {!post ? (
        <main className="flex flex-1 items-center justify-center bg-[#fef9e7] px-4 py-20">
          <div className="max-w-md rounded-2xl bg-white p-12 text-center shadow-md">
            <Folder className="mx-auto mb-3 h-10 w-10 text-primary-600" />
            <h3 className="font-heading font-extrabold text-[#222222]">Không tìm thấy bài viết</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
            </p>
            <Link to="/blog" className="mt-6 inline-block">
              <Button className="h-[38px] rounded-xl bg-primary px-5 text-xs font-bold text-[#333333] hover:bg-primary-400">
                Quay lại trang Blog
              </Button>
            </Link>
          </div>
        </main>
      ) : (
        <>
          {/* Hero — ảnh blur + tiêu đề */}
          <section className="relative flex min-h-[200px] items-center justify-center overflow-hidden md:min-h-[260px] lg:min-h-[300px]">
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-[6px]"
            />
            <div className="absolute inset-0 bg-[#222222]/60" />
            <h1 className="relative z-10 max-w-5xl px-6 text-center font-heading text-lg font-extrabold uppercase leading-snug tracking-wide text-white sm:text-xl md:text-2xl lg:text-[28px]">
              {post.title}
            </h1>
          </section>

          <main className="flex-1 bg-[#fef9e7] py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-6">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
                {/* Nội dung bài viết */}
                <article className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-7 md:p-8">
                  <div
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className={ARTICLE_PROSE}
                  />
                </article>

                {/* Sidebar */}
                <RecentPostsSidebar posts={recentPosts} />
              </div>

              {/* Bài viết liên quan + chia sẻ */}
              <RelatedPostsSection posts={relatedPosts} shareUrl={shareUrl} />
            </div>
          </main>
        </>
      )}
    </LandingLayout>
  )
}

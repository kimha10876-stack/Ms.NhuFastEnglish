import { IMAGES, newsEventsDummy } from '@/features/landing/landing.data'
import type { BlogPost } from './blog.types'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function buildDefaultContent(item: (typeof newsEventsDummy)[number], summary: string): string {
  const img = item.image
    ? `<figure class="blog-inline-image"><img src="${item.image}" alt="" loading="lazy" /></figure>`
    : ''

  return `
    <p>${summary}</p>
    ${img}
    <p>Tại Ms Nhu Fast English, mỗi buổi học đều được thiết kế để học viên thực hành nhiều hơn lý thuyết — đặc biệt với lớp giao tiếp cùng giáo viên nước ngoài, giúp phản xạ tiếng Anh tự nhiên và tự tin hơn từng ngày.</p>
    <h2>Điểm nổi bật</h2>
    <ul class="blog-feature-list">
      <li>Lớp nhỏ, giáo viên theo sát từng học viên</li>
      <li>100% giáo viên nước ngoài cho lớp giao tiếp &amp; Speaking</li>
      <li>Lộ trình cá nhân hóa sau test đầu vào miễn phí</li>
      <li>Học phí minh bạch, chỉ từ 83K/giờ</li>
    </ul>
    <h2>ƯU ĐÃI THÁNG 9 — BACK TO SCHOOL TẠI MS NHU</h2>
    <ul class="blog-promo-list">
      <li>📚 Giảm 10% học phí khi đăng ký combo 3 tháng</li>
      <li>✨ Tặng buổi luyện Speaking 1-1 cho học viên mới</li>
      <li>✅ Test đầu vào &amp; tư vấn lộ trình miễn phí</li>
    </ul>
    <p>Liên hệ hotline <strong>097 638 91 66</strong> hoặc để lại thông tin trên website để được tư vấn lộ trình phù hợp nhất.</p>
  `
}

function buildFeaturedBookstoreContent(): string {
  return `
    <p>Giữa không gian yên tĩnh của nhà sách, học viên Ms Nhu Fast English đã có một trải nghiệm học tiếng Anh vô cùng độc đáo — vừa đọc sách, vừa giao tiếp trực tiếp với giáo viên bản ngữ trong bối cảnh thực tế, giúp từ vựng và phản xạ được &ldquo;neo&rdquo; vào ký ức lâu hơn.</p>
    <figure class="blog-inline-image"><img src="${IMAGES.classForeignTeacher}" alt="Học viên học tiếng Anh cùng giáo viên nước ngoài" loading="lazy" /></figure>
    <p>Thay vì chỉ học trong phòng lớp truyền thống, buổi học ngoại khóa tại nhà sách giúp học viên thoải mái hơn, chủ động mở lời và luyện nghe trong môi trường gần gũi — phù hợp cả trẻ em lẫn người lớn đi làm cần luyện giao tiếp tự nhiên.</p>
    <figure class="blog-inline-image"><img src="${IMAGES.classGroup}" alt="Lớp học nhóm tại Ms Nhu Fast English" loading="lazy" /></figure>
    <h2>Hoạt động nổi bật trong buổi học</h2>
    <ul class="blog-feature-list">
      <li>Thảo luận nhóm theo chủ đề sách &amp; cuộc sống hàng ngày</li>
      <li>Trò chơi từ vựng &amp; phát âm cùng giáo viên nước ngoài</li>
      <li>Luyện nghe – nói qua tình huống mô phỏng thực tế</li>
      <li>Chụp ảnh kỷ niệm &amp; chia sẻ cảm nhận sau buổi học</li>
    </ul>
    <figure class="blog-inline-image"><img src="${IMAGES.classPhoto}" alt="Học viên chụp ảnh cuối buổi học" loading="lazy" /></figure>
    <h2>ƯU ĐÃI THÁNG 9 — BACK TO SCHOOL TẠI MS NHU</h2>
    <ul class="blog-promo-list">
      <li>📚 Giảm 10% học phí combo 3 tháng cho học viên đăng ký sớm</li>
      <li>✨ Miễn phí test đầu vào &amp; nhận lộ trình cá nhân hóa</li>
      <li>✅ Ưu tiên giữ chỗ lớp giao tiếp 1-1 với giáo viên nước ngoài</li>
    </ul>
    <p>Đăng ký tư vấn ngay để trải nghiệm buổi học thử và nhận lộ trình phù hợp với trình độ của bạn.</p>
  `
}

const RICH_CONTENT_BY_SLUG: Record<string, string> = {
  'hoc-tieng-anh-giua-nha-sach-ms-nhu': buildFeaturedBookstoreContent(),
}

/** Dummy blog posts — dùng tạm, thay bằng API sau (cùng nguồn với newsEventsDummy) */
export const blogPostsDummy: BlogPost[] = newsEventsDummy.map((item, index) => {
  const summary = item.excerpt ?? item.title
  const content = RICH_CONTENT_BY_SLUG[item.slug] ?? buildDefaultContent(item, summary)

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnailUrl: item.image,
    summary,
    content,
    isPublished: true,
    createdAt: daysAgo(index * 4 + 1),
    updatedAt: daysAgo(index * 4 + 1),
    viewCount: 86 + index * 23,
    authorId: 'dummy-author',
    authorName: 'Ms Nhu',
    categoryName: 'Tin tức',
    categorySlug: 'tin-tuc',
  }
})

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsDummy.find((p) => p.slug === slug)
}

export function getRecentPosts(count = 8, excludeSlug?: string): BlogPost[] {
  return blogPostsDummy.filter((p) => p.slug !== excludeSlug).slice(0, count)
}

export function getRelatedPosts(currentSlug: string, count = 4): BlogPost[] {
  return blogPostsDummy.filter((p) => p.slug !== currentSlug).slice(0, count)
}

export function paginateBlogPosts(posts: BlogPost[], page: number, pageSize: number) {
  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: posts.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

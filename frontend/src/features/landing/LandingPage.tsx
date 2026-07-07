import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, GraduationCap, TrendingUp, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'
import { useBlogPosts } from '@/features/blog/useBlog'

const features = [
  {
    icon: Target,
    title: 'Lộ trình cá nhân hóa',
    desc: 'Chương trình học được thiết kế riêng cho từng học viên dựa trên trình độ và mục tiêu thực tế.',
  },
  {
    icon: GraduationCap,
    title: 'Giáo viên tận tâm',
    desc: 'Ms. Nhụ với nhiều năm kinh nghiệm giảng dạy, cam kết theo sát và đồng hành cùng bạn.',
  },
  {
    icon: TrendingUp,
    title: 'Tiến bộ nhanh chóng',
    desc: 'Phương pháp học hiện đại, giúp bạn giao tiếp tự nhiên và tự tin hơn mỗi ngày.',
  },
]

const levels = ['Giao tiếp', 'IELTS', 'Thiếu nhi', 'Luyện thi', 'Mất gốc', 'Doanh nghiệp']

export default function LandingPage() {
  const [isHydrated, setIsHydrated] = useState(false)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isStaff = isHydrated && user && (user.roles.includes('Admin') || user.roles.includes('Teacher'))
  
  const { data: blogData } = useBlogPosts({ page: 1, pageSize: 3 })
  const latestPosts = blogData?.items ?? []

  return (
    <div className="min-h-svh flex flex-col bg-white">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">Ms. Nhụ Fast English</span>
          </div>
          {isStaff ? (
            <Link to="/dashboard">
              <Button size="sm" variant="outline">Trang quản lý</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
            Trung tâm Anh ngữ
          </span>
          <h1 className="text-[38px] md:text-[52px] font-bold leading-[1.15] tracking-[-0.03em] mb-5 text-balance">
            Học tiếng Anh<br />
            <span className="text-primary">nhanh hơn, tự tin hơn</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md mx-auto text-balance">
            Nơi mỗi học viên được học theo lộ trình riêng, với phương pháp
            hiện đại và giáo viên tận tâm.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isStaff ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Vào trang quản lý
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/dang-ky">
                  <Button size="lg" className="w-full sm:w-auto px-8">
                    Đăng ký tư vấn miễn phí
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                    Học viên / Giáo viên
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Levels ─────────────────────────────────────────────────────────── */}
      <section className="py-10 px-5 border-y bg-[#F2F2F7]/60">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-center mb-5">
            Các khóa học
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {levels.map((l) => (
              <span
                key={l}
                className="px-4 py-1.5 bg-white border rounded-full text-sm font-medium text-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[26px] font-bold text-center mb-2 text-balance">
            Tại sao chọn Ms. Nhụ Fast English?
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Chúng tôi cam kết mang lại trải nghiệm học tập tốt nhất.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#F2F2F7] rounded-2xl p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Blog Posts ─────────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-16 px-5 bg-gray-50 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
                  Bài viết mới nhất
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Cập nhật các phương pháp học và tin tức mới nhất từ trung tâm.
                </p>
              </div>
              <Link
                to="/blog"
                className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 shrink-0"
              >
                Xem tất cả blog
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col group"
                >
                  {post.thumbnailUrl && (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 border bg-gray-50">
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {post.categoryName && (
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 block">
                      {post.categoryName}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors mb-2">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-1">
                    {post.summary}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition-colors flex items-center gap-1 mt-auto"
                  >
                    Đọc tiếp
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-10 px-5 mb-10">
        <div className="max-w-2xl mx-auto bg-primary rounded-3xl px-8 py-12 text-center">
          <h2 className="text-[24px] font-bold text-white mb-2 text-balance">
            Sẵn sàng bắt đầu hành trình?
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            Tư vấn miễn phí · Không cam kết · Không áp lực
          </p>
          {isStaff ? (
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              >
                Vào trang quản lý
              </Button>
            </Link>
          ) : (
            <Link to="/dang-ky">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              >
                Đăng ký ngay
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-6 px-5 border-t text-center text-xs text-muted-foreground">
        © 2025 Ms. Nhụ Fast English · Trung tâm Anh ngữ
      </footer>

    </div>
  )
}

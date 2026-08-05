import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, GraduationCap, TrendingUp, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'
import { useBlogPosts } from '@/features/blog/useBlog'
import { useCreateConsultation } from '@/features/consultations/useConsultation'

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

  // Consultation form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const { mutate: registerConsultation, isPending } = useCreateConsultation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { fullName?: string; phone?: string; email?: string } = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống'
    }
    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (phone.trim().replace(/\D/g, '').length < 8) {
      newErrors.phone = 'Số điện thoại phải có ít nhất 8 chữ số'
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    registerConsultation(
      { fullName, phone, email: email.trim() || undefined, message: message.trim() || undefined },
      {
        onSuccess: () => {
          setSuccessMessage('Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
          setFullName('')
          setPhone('')
          setEmail('')
          setMessage('')
          setErrors({})
        },
      }
    )
  }

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isStudent = isHydrated && user && user.roles.includes('Student')
  const isLoggedIn = isHydrated && !!user
  
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
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button size="sm" variant="outline">
                {isStudent ? 'Vào lớp học' : 'Trang quản lý'}
              </Button>
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
            {isLoggedIn ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  {isStudent ? 'Vào lớp học ngay' : 'Vào trang quản lý'}
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  onClick={() => {
                    document.getElementById('dang-ky-tu-van')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Đăng ký tư vấn miễn phí
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
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

      {/* ── Consultation Form Section ────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section id="dang-ky-tu-van" className="py-16 px-5 bg-gradient-to-b from-white to-amber-50/20 border-t">
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Tư vấn học tập
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-3">Đăng ký nhận lộ trình học</h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Để lại thông tin bên dưới, Ms. Nhụ sẽ trực tiếp liên hệ và tư vấn lộ trình học phù hợp nhất cho bạn.
              </p>
            </div>

            {successMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800 text-sm animate-in fade-in duration-200">
                <p className="font-bold mb-1">Gửi yêu cầu thành công!</p>
                <p className="text-xs text-emerald-700 leading-relaxed">{successMessage}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-4 text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                  onClick={() => setSuccessMessage('')}
                >
                  Gửi yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="form-fullname" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-fullname"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                    }}
                    className={`w-full h-[38px] px-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-3 focus:ring-amber-500/20 ${
                      errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="form-phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    placeholder="0905123456"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (errors.phone) setErrors({ ...errors, phone: undefined })
                    }}
                    className={`w-full h-[38px] px-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-3 focus:ring-amber-500/20 ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="form-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-xs text-gray-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    className={`w-full h-[38px] px-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-3 focus:ring-amber-500/20 ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="form-message" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mục tiêu học tập <span className="text-xs text-gray-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <textarea
                    id="form-message"
                    rows={3}
                    placeholder="Ví dụ: Học tiếng Anh giao tiếp đi làm, Luyện thi IELTS 6.5, Mất gốc học lại cơ bản..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isPending}
                >
                  {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
                </Button>
              </form>
            )}
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
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              >
                {isStudent ? 'Vào lớp học ngay' : 'Vào trang quản lý'}
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              onClick={() => {
                document.getElementById('dang-ky-tu-van')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Đăng ký ngay
            </Button>
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

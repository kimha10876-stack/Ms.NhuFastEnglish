import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useLogin } from './useAuth'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="min-h-svh flex">

      {/* ── Branding panel (desktop only) ───────────────────────────────── */}
      <div className="hidden md:flex md:w-[45%] bg-primary flex-col justify-between p-10 select-none">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-[17px] tracking-tight">
            Ms. Nhụ Fast English
          </span>
        </div>

        {/* Tagline */}
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-3">
            Hệ thống quản lý
          </p>
          <h2 className="text-white text-[32px] font-bold leading-snug tracking-tight text-balance">
            Chào mừng<br />trở lại!
          </h2>
          <p className="text-white/60 mt-3 leading-relaxed text-sm max-w-xs">
            Quản lý lớp học, học viên và giáo viên của trung tâm — mọi lúc, mọi nơi.
          </p>
        </div>

        <p className="text-white/30 text-xs">© 2025 Ms. Nhụ Fast English</p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-[#F2F2F7]">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">Ms. Nhụ Fast English</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] p-7">
            <div className="mb-6">
              <h1 className="text-[22px] font-bold tracking-tight">Đăng nhập</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Nhập email và mật khẩu của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Link
                    to="/quen-mat-khau"
                    className="text-xs text-primary hover:underline underline-offset-2"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                  Email hoặc mật khẩu không đúng
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-[15px] font-semibold mt-1"
                disabled={isPending}
              >
                {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="text-primary font-medium hover:underline underline-offset-2">
                Đăng ký tài khoản
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Về trang chủ
          </Link>

        </div>
      </div>
    </div>
  )
}

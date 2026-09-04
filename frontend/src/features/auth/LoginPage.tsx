import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PasswordInput } from '@/shared/components/ui/password-input'
import { useLogin } from './useAuth'
import { useAuthStore } from './auth.store'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo     = searchParams.get('redirect') ?? undefined

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin(redirectTo)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(redirectTo ?? '/dashboard', { replace: true })
    }
  }, [user, navigate, redirectTo])

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="min-h-svh flex">

      {/* ── Branding panel (desktop only) ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-10 select-none">
        {/* Logo */}
        <div className="flex flex-col items-start gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/20 bg-background shadow-sm">
            <img src="/logo.png" alt="Ms Nhu Fast English Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Ms Nhu Fast English
          </span>
        </div>

        {/* Tagline */}
        <div>
          <h2 className="text-white text-[30px] font-bold leading-snug tracking-tight text-balance">
          Hệ thống quản lý
          </h2>
          <p className="text-white mt-3 leading-relaxed text-[16px] max-w-xs">
            Quản lý lớp học, học viên và giáo viên của trung tâm — mọi lúc, mọi nơi.
          </p>
        </div>

        <p className="text-white text-xs">© 2025 Ms Nhu Fast English</p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-surface-muted">
        <div className="w-full max-w-[420px]">

          {/* Logo */}
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-border bg-background shadow-sm">
              <img src="/logo.png" alt="Ms Nhu Fast English Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight">Ms Nhu Fast English</span>
          </div>

          {/* Card */}
          <div className="bg-background rounded shadow-sm border border-black/[0.06] p-8 sm:p-9">
            <div className="mb-6">
              <h1 className="text-[24px] lg:text-[30px] font-bold tracking-tight">Chào mừng quay lại</h1>
              <p className="text-muted-foreground text-[16px] mt-1">
                Nhập tài khoản và mật khẩu của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
 <label className="text-sm text-label">Tài khoản</label>
                <Input
                  type="text"
                  placeholder="Email hoặc tên đăng nhập"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
 <label className="text-sm text-label">Mật khẩu</label>
                  <Link
                    to="/quen-mat-khau"
                    className="text-xs text-primary hover:underline underline-offset-2"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <PasswordInput
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                  {(error as any)?.response?.data?.message || 'Email hoặc mật khẩu không đúng'}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-1"
                loading={isPending}
              >
                Đăng nhập
              </Button>
            </form>

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

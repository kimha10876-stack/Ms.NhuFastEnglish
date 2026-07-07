import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useRegisterStudent } from './useAuth'
import { useAuthStore } from './auth.store'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const inviteToken    = searchParams.get('invite')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const { mutate: register, isPending, error } = useRegisterStudent(inviteToken ?? undefined)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const set = (field: string) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp')
      return
    }
    setPasswordError('')
    register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    })
  }

  return (
    <div className="min-h-svh flex">

      {/* ── Branding panel (desktop only) ───────────────────────────────── */}
      <div className="hidden md:flex md:w-[45%] bg-primary flex-col justify-between p-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-[17px] tracking-tight">
            Ms. Nhụ Fast English
          </span>
        </div>

        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-3">
            Đăng ký học viên
          </p>
          <h2 className="text-white text-[32px] font-bold leading-snug tracking-tight text-balance">
            Bắt đầu<br />hành trình của bạn
          </h2>
          <p className="text-white/60 mt-3 leading-relaxed text-sm max-w-xs">
            Tạo tài khoản miễn phí và nhận lộ trình học tiếng Anh được cá nhân hóa cho bạn.
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
              <h1 className="text-[22px] font-bold tracking-tight">Tạo tài khoản</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Điền thông tin để đăng ký học viên
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={set('fullName')}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  autoComplete="new-password"
                />
              </div>

              {passwordError && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                  {passwordError}
                </p>
              )}
              {error && (
                <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                  {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Đăng ký thất bại, vui lòng thử lại'}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-[15px] font-semibold mt-1"
                disabled={isPending}
              >
                {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline underline-offset-2">
                Đăng nhập
              </Link>
            </div>
          </div>

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

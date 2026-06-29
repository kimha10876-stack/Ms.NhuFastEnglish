import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useForgotPassword, useResetPassword } from './useAuth'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep]               = useState<1 | 2 | 3>(1)
  const [email, setEmail]             = useState('')
  const [otp, setOtp]                 = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [pwdError, setPwdError]       = useState('')

  const { mutate: sendOtp, isPending: sending, error: sendError } = useForgotPassword()
  const { mutate: resetPwd, isPending: resetting, error: resetError } = useResetPassword()

  const handleSendOtp = (e: { preventDefault(): void }) => {
    e.preventDefault()
    sendOtp({ email }, { onSuccess: () => setStep(2) })
  }

  const handleReset = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (newPassword !== confirmPwd) {
      setPwdError('Mật khẩu xác nhận không khớp')
      return
    }
    setPwdError('')
    resetPwd({ email, otp, newPassword }, { onSuccess: () => setStep(3) })
  }

  return (
    <div className="min-h-svh flex">

      {/* ── Branding panel ──────────────────────────────────────────────── */}
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
            Bảo mật tài khoản
          </p>
          <h2 className="text-white text-[32px] font-bold leading-snug tracking-tight text-balance">
            Lấy lại<br />mật khẩu
          </h2>
          <p className="text-white/60 mt-3 leading-relaxed text-sm max-w-xs">
            Nhập email đăng ký, chúng tôi sẽ gửi mã OTP để xác thực và đặt lại mật khẩu.
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

          <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] p-7">

            {/* ── Step 1: nhập email ── */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h1 className="text-[22px] font-bold tracking-tight">Quên mật khẩu</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Nhập email để nhận mã OTP
                  </p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {sendError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                      {(sendError as { response?: { data?: { message?: string } } })?.response?.data?.message
                        ?? 'Có lỗi xảy ra, vui lòng thử lại'}
                    </p>
                  )}
                  <Button type="submit" className="w-full h-11 text-[15px] font-semibold" disabled={sending}>
                    {sending ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </Button>
                </form>
              </>
            )}

            {/* ── Step 2: nhập OTP + mật khẩu mới ── */}
            {step === 2 && (
              <>
                <div className="mb-6">
                  <h1 className="text-[22px] font-bold tracking-tight">Nhập mã OTP</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Kiểm tra email <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mã OTP (6 số)</label>
                    <Input
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoFocus
                      inputMode="numeric"
                      className="text-center text-xl font-bold tracking-[0.3em]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mật khẩu mới</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {pwdError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                      {pwdError}
                    </p>
                  )}
                  {resetError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                      {(resetError as { response?: { data?: { message?: string } } })?.response?.data?.message
                        ?? 'Mã OTP không đúng hoặc đã hết hạn'}
                    </p>
                  )}
                  <Button type="submit" className="w-full h-11 text-[15px] font-semibold" disabled={resetting || otp.length < 6}>
                    {resetting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                </form>
              </>
            )}

            {/* ── Step 3: thành công ── */}
            {step === 3 && (
              <div className="py-4 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="text-[20px] font-bold tracking-tight mb-2">Đặt lại thành công!</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Mật khẩu của bạn đã được cập nhật.
                </p>
                <Button className="w-full h-11 text-[15px] font-semibold" onClick={() => navigate('/login')}>
                  Đăng nhập ngay
                </Button>
              </div>
            )}

          </div>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại đăng nhập
          </Link>

        </div>
      </div>
    </div>
  )
}

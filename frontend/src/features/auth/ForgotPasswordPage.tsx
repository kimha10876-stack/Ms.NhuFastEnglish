import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PasswordInput } from '@/shared/components/ui/password-input'
import { useForgotPassword, useVerifyOtp, useResetPassword } from './useAuth'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep]               = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail]             = useState('')
  const [otp, setOtp]                 = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [pwdError, setPwdError]       = useState('')
  const [countdown, setCountdown]     = useState(0)

  const { mutate: sendOtp,   isPending: sending,    error: sendError   } = useForgotPassword()
  const { mutate: verifyOtp, isPending: verifying,  error: verifyError } = useVerifyOtp()
  const { mutate: resetPwd,  isPending: resetting,  error: resetError  } = useResetPassword()

  // Đếm ngược 60s cho nút resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOtp = (e: { preventDefault(): void }) => {
    e.preventDefault()
    sendOtp({ email }, {
      onSuccess: () => {
        setStep(2)
        setCountdown(60)
      },
    })
  }

  const handleResend = () => {
    sendOtp({ email }, { onSuccess: () => setCountdown(60) })
  }

  const handleVerifyOtp = (e: { preventDefault(): void }) => {
    e.preventDefault()
    verifyOtp({ email, otp }, { onSuccess: () => setStep(3) })
  }

  const handleReset = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (newPassword !== confirmPwd) {
      setPwdError('Mật khẩu xác nhận không khớp')
      return
    }
    setPwdError('')
    resetPwd({ email, otp, newPassword }, { onSuccess: () => setStep(4) })
  }

  const serverMsg = (err: unknown) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message

  return (
    <div className="min-h-svh flex">

      {/* ── Branding panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/20 bg-background">
            <img src="/logo.png" alt="Ms Nhu Fast English Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-white text-[17px] tracking-tight">
            Ms Nhu Fast English
          </span>
        </div>
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-3">
            Bảo mật tài khoản
          </p>
          <h2 className="text-white text-[30px] font-bold leading-snug tracking-tight text-balance">
            Lấy lại<br />mật khẩu
          </h2>
          <p className="text-white/60 mt-3 leading-relaxed text-[16px] max-w-xs">
            Nhập email, chúng tôi sẽ gửi mã xác nhận (OTP) để đặt lại mật khẩu.
          </p>
        </div>
        <p className="text-white/30 text-xs">© 2025 Ms Nhu Fast English</p>
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

          <div className="bg-background rounded shadow-sm border border-black/[0.06] p-8 sm:p-9">

            {/* ── Step 1: nhập email ── */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h1 className="text-[24px] lg:text-[30px] font-bold tracking-tight">Quên mật khẩu</h1>
                  <p className="text-muted-foreground text-[16px] mt-1">
                    Nhập email, chúng tôi sẽ gửi mã xác nhận (OTP) để đặt lại mật khẩu.
                  </p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
 <label className="text-sm text-label">Email</label>
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
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                      {serverMsg(sendError) ?? 'Có lỗi xảy ra, vui lòng thử lại'}
                    </p>
                  )}
                  <Button type="submit" className="w-full h-11 text-[15px] font-semibold" loading={sending}>
                    Gửi mã OTP
                  </Button>
                </form>
              </>
            )}

            {/* ── Step 2: nhập OTP ── */}
            {step === 2 && (
              <>
                <div className="mb-6">
                  <h1 className="text-[24px] lg:text-[30px] font-bold tracking-tight">Nhập mã OTP</h1>
                  <p className="text-muted-foreground text-[16px] mt-1">
                    Kiểm tra email <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
 <label className="text-sm text-label">Mã OTP (6 số)</label>
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
                  {verifyError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                      {serverMsg(verifyError) ?? 'Mã OTP không hợp lệ'}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 text-[15px] font-semibold"
                    loading={verifying}
                    disabled={otp.length < 6}
                  >
                    Xác nhận OTP
                  </Button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || sending}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Gửi lại sau ${countdown}s`
                      : sending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                  </button>
                  {sendError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                      {serverMsg(sendError) ?? 'Không thể gửi lại, thử lại sau'}
                    </p>
                  )}
                </form>
              </>
            )}

            {/* ── Step 3: nhập mật khẩu mới ── */}
            {step === 3 && (
              <>
                <div className="mb-6">
                  <h1 className="text-[24px] lg:text-[30px] font-bold tracking-tight">Mật khẩu mới</h1>
                  <p className="text-muted-foreground text-[16px] mt-1">Nhập mật khẩu mới cho tài khoản</p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
 <label className="text-sm text-label">Mật khẩu mới</label>
                    <PasswordInput
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoFocus
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
 <label className="text-sm text-label">Xác nhận mật khẩu</label>
                    <PasswordInput
                      placeholder="••••••••"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {pwdError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                      {pwdError}
                    </p>
                  )}
                  {resetError && (
                    <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded">
                      {serverMsg(resetError) ?? 'Có lỗi xảy ra, vui lòng thử lại'}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 text-[15px] font-semibold"
                    loading={resetting}
                  >
                    Đặt lại mật khẩu
                  </Button>
                </form>
              </>
            )}

            {/* ── Step 4: thành công ── */}
            {step === 4 && (
              <div className="py-4 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="text-[20px] font-bold tracking-tight mb-2">Đặt lại thành công!</h1>
                <p className="text-muted-foreground text-[16px] mb-6">
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

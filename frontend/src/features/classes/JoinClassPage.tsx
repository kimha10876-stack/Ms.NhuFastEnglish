import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BookOpen, Users, LogIn, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'
import { useInviteInfo, useJoinByInvite } from './useClasses'

export default function JoinClassPage() {
  const { token = '' } = useParams<{ token: string }>()
  const navigate        = useNavigate()
  const user            = useAuthStore((s) => s.user)
  const isLoggedIn      = !!user

  const { data: info, isLoading, isError } = useInviteInfo(token)
  const { mutate: join, isPending: joining, isSuccess, error: joinError } = useJoinByInvite()

  // Auto-join if user just returned from login/register
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('invite_auto_join')
    if (justLoggedIn === token && isLoggedIn && info && !isSuccess) {
      sessionStorage.removeItem('invite_auto_join')
      join(token)
    }
  }, [isLoggedIn, info, token, isSuccess, join])

  const handleJoin = () => {
    if (!isLoggedIn) return
    join(token, {
      onSuccess: () => setTimeout(() => navigate('/classes'), 2000),
    })
  }

  const joinErrMsg =
    (joinError as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Có lỗi xảy ra khi tham gia lớp học'

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-[#F2F2F7] px-4 py-10">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-[17px] tracking-tight">Ms. Nhụ Fast English</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] w-full max-w-sm p-7">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Đang tải thông tin lớp...</p>
          </div>
        )}

        {/* Error: invalid link */}
        {isError && (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h2 className="font-bold text-[18px] mb-1">Link không hợp lệ</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Link mời đã hết hạn hoặc không tồn tại.
            </p>
            <Button variant="outline" asChild>
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
            <h2 className="font-bold text-[18px] mb-1">Tham gia thành công!</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Bạn đã vào lớp <span className="font-medium text-foreground">{info?.className}</span>.
              Đang chuyển hướng...
            </p>
          </div>
        )}

        {/* Info loaded */}
        {info && !isSuccess && (
          <>
            {/* Class info card */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{ backgroundColor: info.categoryColorHex + '18', borderLeft: `3px solid ${info.categoryColorHex}` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: info.categoryColorHex }}>
                {info.categoryName}
              </p>
              <h2 className="font-bold text-[18px] mb-0.5">{info.className}</h2>
              <p className="text-sm text-muted-foreground mb-2">{info.teacherName}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {info.memberCount} học sinh
                {info.maxStudents && ` / tối đa ${info.maxStudents}`}
              </div>
            </div>

            {/* Join error */}
            {joinError && (
              <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg mb-3">
                {joinErrMsg}
              </p>
            )}

            {/* Logged in: join button */}
            {isLoggedIn && (
              <Button className="w-full h-11 text-[15px] font-semibold" onClick={handleJoin} disabled={joining}>
                {joining ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang tham gia...</>
                ) : 'Tham gia lớp học'}
              </Button>
            )}

            {/* Not logged in: 2 options */}
            {!isLoggedIn && (
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground mb-1">
                  Bạn cần tài khoản để tham gia lớp học này
                </p>
                <Button className="w-full h-11 text-[15px] font-semibold gap-2" asChild
                  onClick={() => sessionStorage.setItem('invite_auto_join', token)}
                >
                  <Link to={`/dang-ky?invite=${token}`}>
                    <UserPlus className="h-4 w-4" />
                    Đăng ký tài khoản mới
                  </Link>
                </Button>
                <Button variant="outline" className="w-full h-11 gap-2" asChild
                  onClick={() => sessionStorage.setItem('invite_auto_join', token)}
                >
                  <Link to={`/login?redirect=/tham-gia/${token}`}>
                    <LogIn className="h-4 w-4" />
                    Đã có tài khoản, đăng nhập
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

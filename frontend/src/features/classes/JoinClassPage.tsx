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

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('invite_auto_join')
    if (justLoggedIn === token && isLoggedIn && info && !isSuccess) {
      sessionStorage.removeItem('invite_auto_join')
      join(token)
    }
  }, [isLoggedIn, info, token, isSuccess, join])

  const joinErrMsg =
    (joinError as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Có lỗi xảy ra khi tham gia lớp học'

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-gray-900" />
        </div>
        <span className="font-bold text-[17px] tracking-tight text-gray-900">Ms Nhu Fast English</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-12 px-7">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Đang tải thông tin lớp...</p>
          </div>
        )}

        {/* Invalid link */}
        {isError && (
          <div className="flex flex-col items-center py-12 px-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="font-bold text-[18px] text-gray-900 mb-1">Link không hợp lệ</h2>
            <p className="text-sm text-gray-500 mb-6">
              Link mời đã hết hạn hoặc không tồn tại.
            </p>
            <Button variant="secondary" asChild>
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="flex flex-col items-center py-12 px-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            <h2 className="font-bold text-[18px] text-gray-900 mb-1">Tham gia thành công!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Bạn đã vào lớp <span className="font-semibold text-gray-900">{info?.className}</span>.
            </p>
            <Button onClick={() => navigate('/classes')}>Xem lớp học</Button>
          </div>
        )}

        {/* Class info + actions */}
        {info && !isSuccess && (
          <div className="p-7">
            {/* Class card */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden mb-5">
              <div className="px-4 py-3" style={{ backgroundColor: info.categoryColorHex + '18' }}>
                <span
                  className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: info.categoryColorHex }}
                >
                  {info.categoryName}
                </span>
              </div>
              <div className="px-4 py-4">
                <h2 className="font-bold text-[18px] text-gray-900 mb-0.5">{info.className}</h2>
                <p className="text-sm text-gray-500 mb-3">{info.teacherName}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {info.memberCount} học viên
                    {info.maxStudents && ` · tối đa ${info.maxStudents}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {joinError && (
              <div className="bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-xl mb-4">
                <p className="text-[13px] text-red-700">{joinErrMsg}</p>
              </div>
            )}

            {/* Logged in */}
            {isLoggedIn && (
              <Button className="w-full h-11 text-[15px]" onClick={() => join(token, { onSuccess: () => setTimeout(() => navigate('/classes'), 1500) })} disabled={joining}>
                {joining
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Đang tham gia...</>
                  : 'Tham gia lớp học'}
              </Button>
            )}

            {/* Not logged in */}
            {!isLoggedIn && (
              <div className="space-y-3">
                <p className="text-xs text-center text-gray-500 mb-1">
                  Bạn cần tài khoản để tham gia lớp học này
                </p>
                <Button
                  className="w-full h-11 gap-2 text-[15px]"
                  asChild
                  onClick={() => sessionStorage.setItem('invite_auto_join', token)}
                >
                  <Link to={`/dang-ky?invite=${token}`}>
                    <UserPlus className="h-4 w-4" />
                    Đăng ký tài khoản mới
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full h-11 gap-2"
                  asChild
                  onClick={() => sessionStorage.setItem('invite_auto_join', token)}
                >
                  <Link to={`/login?redirect=/tham-gia/${token}`}>
                    <LogIn className="h-4 w-4" />
                    Đã có tài khoản, đăng nhập
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

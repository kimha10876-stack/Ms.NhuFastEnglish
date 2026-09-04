import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'

interface PublicBlogLayoutProps {
  children: ReactNode
  banner?: ReactNode
  secondaryNav?: ReactNode
  mainClassName?: string
}

export function PublicBlogLayout({ children, banner, secondaryNav, mainClassName }: PublicBlogLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const isStudent = user?.roles.includes('Student') ?? false

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <header className="sticky top-0 z-50 shrink-0 border-b border-black/[0.06] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
              <BookOpen className="h-4 w-4 text-gray-900" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-gray-900">Ms Nhu Fast English</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <Link to="/dashboard">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-amber-500/30 font-semibold text-amber-700 hover:bg-amber-50"
                >
                  {isStudent ? 'Vào lớp học' : 'Trang quản lý'}
                </Button>
              </Link>
            )}
            {secondaryNav}
          </div>
        </div>
      </header>

      {banner}

      <main className={mainClassName ?? 'mx-auto w-full max-w-5xl flex-1 px-5 py-8'}>{children}</main>

      <footer className="shrink-0 border-t bg-white px-5 py-6 text-center text-xs text-gray-400">
        © 2025 Ms Nhu Fast English · Trung tâm Anh ngữ
      </footer>
    </div>
  )
}

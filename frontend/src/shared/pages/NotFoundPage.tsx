import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded border border-border bg-card p-8 text-center shadow-sm">
        <SearchX className="mx-auto h-12 w-12 text-primary" />
        <p className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900">404</p>
        <h1 className="mt-3 text-lg font-bold text-ink-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </main>
  )
}

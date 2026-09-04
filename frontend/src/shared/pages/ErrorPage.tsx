import { Link } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface ErrorPageProps {
  onRetry?: () => void
}

export default function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded border border-border bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-5 text-lg font-bold text-ink-900">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          )}
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

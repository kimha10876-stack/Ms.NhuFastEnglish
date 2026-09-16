import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Home, RefreshCw } from 'lucide-react'
import { LandingLayout } from '@/features/landing/LandingLayout'
import { LandingButton } from '@/features/landing/LandingButton'
import { Mascot } from '@/features/landing/components/Mascot'
import type { MascotKey } from '@/features/landing/landing.data'

export function LandingErrorPage({
  code,
  title,
  description,
  mascot,
  onRetry,
  extraActions,
}: {
  code: string
  title: string
  description: string
  mascot: MascotKey
  onRetry?: () => void
  extraActions?: ReactNode
}) {
  return (
    <LandingLayout>
      <main className="relative flex flex-1 flex-col overflow-hidden bg-[#fef9e7]">
        <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary sm:w-2" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-1/4 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-16 sm:py-20 lg:px-6 lg:py-24">
          <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="font-heading text-[72px] font-extrabold leading-none tracking-tight text-primary sm:text-[96px]">
                {code}
              </p>
              <h1 className="font-heading mt-4 text-balance text-2xl font-extrabold tracking-tight text-[#222222] sm:text-3xl">
                {title}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0 mx-auto">
                {description}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <LandingButton asChild size="lg">
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    Về trang chủ
                  </Link>
                </LandingButton>

                {onRetry ? (
                  <LandingButton type="button" variant="outline" size="lg" onClick={onRetry}>
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                  </LandingButton>
                ) : (
                  <LandingButton asChild variant="outline" size="lg">
                    <Link to="/#lien-he">Liên hệ tư vấn</Link>
                  </LandingButton>
                )}

                {extraActions}
              </div>
            </div>

            <Mascot
              name={mascot}
              alt=""
              className="mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:max-w-none"
              imgClassName="drop-shadow-xl"
            />
          </div>
        </div>
      </main>
    </LandingLayout>
  )
}

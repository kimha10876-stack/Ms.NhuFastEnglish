import type { ReactNode } from 'react'
import { LandingProvider } from './landing.context'
import { useLandingContextValue } from './useLandingContextValue'
import { FloatingActions } from './components/FloatingActions'
import { LandingHeader } from './sections/LandingHeader'
import { LandingFooter } from './sections/LandingFooter'

export function LandingLayout({ children }: { children: ReactNode }) {
  const context = useLandingContextValue()

  return (
    <LandingProvider value={context}>
      <div className="landing-page flex min-h-svh flex-col">
        <LandingHeader />
        {children}
        <LandingFooter />
        <FloatingActions />
      </div>
    </LandingProvider>
  )
}

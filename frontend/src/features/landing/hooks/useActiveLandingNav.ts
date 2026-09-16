import { useEffect, useState } from 'react'
import { LANDING_NAV_SECTIONS, type LandingNavId } from '../landing.nav'

const HEADER_OFFSET = 96

function getDocumentTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY
}

function resolveActiveSection(): LandingNavId {
  const scrollY = window.scrollY + HEADER_OFFSET
  let current: LandingNavId = 'home'

  for (const { id, navId } of LANDING_NAV_SECTIONS) {
    const el = document.getElementById(id)
    if (!el) continue
    if (getDocumentTop(el) <= scrollY) {
      current = navId
    }
  }

  return current
}

export function useActiveLandingNav(enabled: boolean): LandingNavId {
  const [active, setActive] = useState<LandingNavId>('home')

  useEffect(() => {
    if (!enabled) return

    const update = () => setActive(resolveActiveSection())

    update()
    const raf = requestAnimationFrame(update)

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled])

  return active
}

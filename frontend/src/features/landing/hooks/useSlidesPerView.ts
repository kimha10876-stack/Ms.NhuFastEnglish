import { useEffect, useState } from 'react'

/** Carousel landing: 4 → 3 → 2 → 1 item theo breakpoint */
export function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(4)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setSlidesPerView(1)
      else if (w < 1024) setSlidesPerView(2)
      else if (w < 1280) setSlidesPerView(3)
      else setSlidesPerView(4)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return slidesPerView
}

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { Mascot } from '../components/Mascot'
import { galleryImages } from '../landing.data'

const AUTO_MS = 4500

export function GallerySection() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = galleryImages.length

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % total) + total) % total)
    },
    [total]
  )

  useEffect(() => {
    if (paused || total <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [paused, total])

  return (
    <section id="hinh-anh" className="py-12 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <Mascot
          name="backpackWalk"
          className="absolute -top-4 right-4 hidden w-28 md:block lg:-top-8 lg:right-8 lg:w-36"
        />
        <h2 className="font-heading text-[28px] font-extrabold text-[#222222] sm:text-[40px]">
          Không Gian Học Tập
        </h2>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Ảnh thực tế tại lớp học và ngày thi — TP.HCM
        </p>
      </div>

      <div
        className="relative mt-8 w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {galleryImages.map(({ src, alt, caption }) => (
            <figure key={src} className="relative w-full shrink-0">
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="aspect-[21/9] w-full object-cover sm:aspect-[16/7] lg:aspect-[21/8]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#222222]/80 to-transparent px-6 py-4 text-sm text-white sm:px-10 sm:py-6">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {galleryImages.map(({ src }, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Ảnh ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === index ? 'w-8 bg-primary' : 'w-2 bg-primary/40 hover:bg-primary/60'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

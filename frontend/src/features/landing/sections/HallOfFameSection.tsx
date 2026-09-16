import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useSlidesPerView } from '../hooks/useSlidesPerView'
import { Mascot } from '../components/Mascot'
import { hallOfFame } from '../landing.data'

function FameCard({ name, achievement, photo }: { name: string; achievement: string; photo: string }) {
  return (
    <article className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#222222] shadow-lg">
      <img
        src={photo}
        alt={name}
        loading="lazy"
        className="h-full w-full object-cover object-top"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#222222] via-[#222222]/80 to-transparent px-4 pb-5 pt-20">
        <p className="font-heading text-base font-extrabold leading-snug text-white">{name}</p>
        <p className="mt-1 text-sm text-white/80">{achievement}</p>
      </div>
    </article>
  )
}

export function HallOfFameSection() {
  const slidesPerView = useSlidesPerView()
  const [page, setPage] = useState(0)

  const maxPage = Math.max(0, hallOfFame.length - slidesPerView)

  useEffect(() => {
    setPage((p) => Math.min(p, maxPage))
  }, [maxPage])

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(() => setPage((p) => Math.min(maxPage, p + 1)), [maxPage])

  return (
    <section id="bang-vang" className="scroll-mt-24 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="relative flex items-start justify-between gap-4">
          <h2 className="font-heading text-[28px] font-extrabold leading-tight sm:text-[40px]">
            <span className="text-[#222222]">Bảng Vàng </span>
            <span className="text-primary">Vinh Danh</span>
          </h2>
          <Mascot name="ieltsCard" className="hidden w-28 shrink-0 sm:block lg:w-36" />
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Slide trước"
            onClick={goPrev}
            disabled={page === 0}
            className={cn(
              'absolute -left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-primary/20 shadow-md transition-colors sm:-left-3',
              page === 0
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-primary hover:border-primary'
            )}
          >
            <ChevronLeft className="h-5 w-5 text-[#222222]" />
          </button>

          <div className="overflow-hidden px-8 sm:px-10">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${page * (100 / slidesPerView)}%)` }}
            >
              {hallOfFame.map(({ name, achievement, photo }) => (
                <div
                  key={`${name}-${achievement}-${photo}`}
                  className="shrink-0 px-2.5"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <FameCard name={name} achievement={achievement} photo={photo} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Slide sau"
            onClick={goNext}
            disabled={page >= maxPage}
            className={cn(
              'absolute -right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-primary/20 shadow-md transition-colors sm:-right-3',
              page >= maxPage
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-primary hover:border-primary'
            )}
          >
            <ChevronRight className="h-5 w-5 text-[#222222]" />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setPage(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === page ? 'w-6 bg-primary' : 'w-2 bg-primary/35'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

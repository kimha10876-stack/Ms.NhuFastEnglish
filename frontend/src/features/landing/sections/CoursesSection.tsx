import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { IecSectionHeader } from '../components/IecSectionHeader'
import { Mascot } from '../components/Mascot'
import { useSlidesPerView } from '../hooks/useSlidesPerView'
import { useLanding } from '../landing.context'
import { courses } from '../landing.data'

function CourseCard({
  name,
  level,
  slug,
  bullets,
  image,
}: {
  name: string
  level: string
  slug: string
  bullets: string[]
  image: string
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/[0.04]">
      <h3 className="font-heading text-base font-extrabold leading-snug text-[#222222] sm:text-[17px]">
        Chương trình {name}
        <span className="font-extrabold"> ({level})</span>
      </h3>

      <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={image}
          alt={`Khóa học ${name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <ul className="mt-4 flex-1 space-y-3">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2.5 text-sm leading-snug text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-3 w-3 text-[#222222]" strokeWidth={3} />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <Link
        to={`/khoa-hoc/${slug}`}
        className="font-heading mt-5 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary py-3 text-sm font-semibold text-[#333333] transition-colors hover:bg-primary-400"
      >
        Tìm hiểu thêm
        <ChevronRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

export function CoursesSection() {
  const { centerName } = useLanding()
  const slidesPerView = useSlidesPerView()
  const [page, setPage] = useState(0)

  const maxPage = Math.max(0, courses.length - slidesPerView)

  useEffect(() => {
    setPage((p) => Math.min(p, maxPage))
  }, [maxPage])

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(() => setPage((p) => Math.min(maxPage, p + 1)), [maxPage])

  return (
    <section id="khoa-hoc" className="scroll-mt-24 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <IecSectionHeader
          eyebrow={`Chương trình học tại ${centerName}`}
          eyebrowPill
          title="Học Đúng Mục Tiêu –"
          titleHighlight="Phát Triển Toàn Diện"
          desc="Lộ trình khoa học từ mất gốc đến luyện thi, giúp bạn tự tin sử dụng tiếng Anh và sẵn sàng chinh phục mục tiêu tại TP.HCM."
        />

        <div className="relative mt-10">
          <Mascot
            name="thumbsUp"
            className="absolute -top-20 right-0 z-0 hidden w-28 md:block lg:-top-24 lg:w-36"
          />
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
              {courses.map((course) => (
                <div
                  key={course.name}
                  className="shrink-0 px-2.5"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <CourseCard
                    name={course.name}
                    level={course.level}
                    slug={course.slug}
                    bullets={course.bullets}
                    image={course.image}
                  />
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

        {/* Dots */}
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

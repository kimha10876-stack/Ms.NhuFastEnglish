import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { BrandLogo } from '../components/BrandLogo'
import type { Course } from '../landing.data'

export function CourseHeroBanner({ course }: { course: Course }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-[#222222] shadow-xl lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:py-14">
        <BrandLogo alt="" className="mb-6 h-12 w-12 text-xs" />
        <h2 className="font-heading text-balance text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-[2rem]">
          Chương trình {course.name}
          <span className="mt-1 block text-lg text-primary sm:text-xl">({course.level})</span>
        </h2>
        <p className="mt-4 text-sm text-white/75">
          Mục tiêu: <span className="font-semibold text-primary">{course.target}</span>
        </p>
      </div>
      <div className="relative min-h-[220px] lg:min-h-full">
        <img
          src={course.image}
          alt={`Chương trình ${course.name}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

export function CourseRoadmapBlock({
  course,
  imageRight = false,
}: {
  course: Course
  imageRight?: boolean
}) {
  return (
    <div
      className={cn(
        'mt-6 overflow-hidden rounded-3xl bg-[#222222] shadow-xl lg:grid lg:grid-cols-2',
        imageRight && 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1'
      )}
    >
      <div className="relative min-h-[220px] lg:min-h-[320px]">
        <img
          src={course.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
        <h3 className="font-heading text-xl font-extrabold text-white sm:text-2xl">
          Lộ trình phát triển theo từng giai đoạn học tập
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">{course.roadmap}</p>
        <ul className="mt-6 space-y-3">
          {course.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5 text-sm text-white/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-[#222222]" strokeWidth={3} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

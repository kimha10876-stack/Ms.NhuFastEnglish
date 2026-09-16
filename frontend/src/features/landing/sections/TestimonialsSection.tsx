import { Star } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { SectionHeading } from '../components/SectionHeading'
import { certificateImages, testimonials } from '../landing.data'

export function TestimonialsSection() {
  return (
    <section
      id="hoc-vien"
      className="border-t border-gray-100 bg-[#faf7f0] px-4 py-16 lg:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Câu chuyện học viên"
          eyebrowClass="bg-orange-100 text-orange-700"
          title="Học viên nói gì về chúng tôi"
          desc="Từ mất gốc đến đạt mục tiêu — mỗi lộ trình là một câu chuyện riêng."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ initials, name, meta, result, quote, badge, tint }) => (
            <figure
              key={name}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-primary-500">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-xs', badge)}>{result}</span>
              </div>

              <blockquote
                className={cn('flex-1 rounded-xl p-4 text-sm leading-relaxed text-gray-700', tint)}
              >
                “{quote}”
              </blockquote>

              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-[#333333]">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-900">{name}</p>
                  <p className="truncate text-xs text-gray-500">{meta}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-gray-200 bg-white p-6 lg:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg tracking-tight text-gray-900">Nhận chứng chỉ cùng Ms Nhu</h3>
              <p className="mt-1 text-sm text-gray-600">
                Khoảnh khắc học viên cầm trên tay kết quả IELTS sau khóa học.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {certificateImages.map(({ src, alt }) => (
              <div
                key={src}
                className="aspect-[4/5] overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
              >
                <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

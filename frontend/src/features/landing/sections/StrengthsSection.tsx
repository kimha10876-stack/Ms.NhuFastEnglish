import { cn } from '@/shared/utils/cn'
import { SectionHeading } from '../components/SectionHeading'
import { useLanding } from '../landing.context'
import { strengths } from '../landing.data'

export function StrengthsSection() {
  const { centerName } = useLanding()

  return (
    <section className="border-t border-gray-100 bg-white px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Vì sao chọn chúng tôi"
          eyebrowClass="bg-violet-100 text-violet-700"
          title={`Điều làm nên ${centerName}`}
          desc="Không dạy đại trà — mỗi học viên có lộ trình, giáo viên và tốc độ học riêng."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {strengths.map(({ icon: Icon, title, desc, tile }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
              >
                <span className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', tile)}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-base tracking-tight text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

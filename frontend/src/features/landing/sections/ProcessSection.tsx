import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { LandingButton } from '../LandingButton'
import { SectionHeading } from '../components/SectionHeading'
import { useLanding } from '../landing.context'
import { processSteps } from '../landing.data'

export function ProcessSection() {
  const { scrollToConsult } = useLanding()

  return (
    <section className="bg-[#222222] px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          onDark
          eyebrow="Quy trình học"
          eyebrowClass="bg-primary-500 text-[#333333]"
          title="4 bước từ test đầu vào đến khi đạt mục tiêu"
          desc="Không đăng ký rồi mới tính — bạn biết rõ mình đang ở đâu và sẽ đi thế nào trước khi vào lớp."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map(({ step, icon: Icon, title, desc, tile }) => (
            <div
              key={step}
              className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition-colors hover:border-primary/50"
            >
              <span className="absolute right-5 top-4 text-3xl tracking-tight text-white/10">{step}</span>
              <span className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', tile)}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mb-2 text-base tracking-tight text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <LandingButton size="lg" onClick={scrollToConsult}>
            Đăng ký test đầu vào miễn phí
            <ChevronRight className="h-4 w-4" />
          </LandingButton>
        </div>
      </div>
    </section>
  )
}

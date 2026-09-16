import { Mascot } from '../components/Mascot'
import { useLanding } from '../landing.context'
import { IMAGES, coreValues, type CoreValue } from '../landing.data'

function ValueCard({ icon: Icon, title, desc }: Pick<CoreValue, 'icon' | 'title' | 'desc'>) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur-sm sm:p-6">
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#222222] text-primary">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-base font-extrabold leading-snug text-[#222222]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{desc}</p>
        </div>
      </div>
    </article>
  )
}

function ValueColumn({
  items,
  className,
}: {
  items: CoreValue[]
  className?: string
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <ValueCard key={item.title} {...item} />
      ))}
    </div>
  )
}

function MountainBg() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-56 text-[#222222]/[0.06] sm:h-72"
      aria-hidden
    >
      <svg viewBox="0 0 1440 280" preserveAspectRatio="none" className="h-full w-full">
        <path
          fill="currentColor"
          d="M0,220 L120,160 L240,200 L360,120 L480,180 L600,100 L720,170 L840,90 L960,150 L1080,110 L1200,190 L1320,130 L1440,200 L1440,280 L0,280 Z"
        />
        <path
          fill="currentColor"
          opacity="0.6"
          d="M0,250 L200,190 L400,230 L600,170 L800,240 L1000,180 L1200,220 L1440,200 L1440,280 L0,280 Z"
        />
      </svg>
    </div>
  )
}

export function CoreValuesSection() {
  const { centerName } = useLanding()
  const left = coreValues.filter((v) => v.side === 'left')
  const right = coreValues.filter((v) => v.side === 'right')

  return (
    <section id="gia-tri" className="relative overflow-hidden py-16 lg:py-24">
      <MountainBg />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        {/* Mobile / tablet: title + image trước, cards sau */}
        <div className="text-center lg:hidden">
          <h2 className="font-heading text-[28px] font-extrabold leading-tight text-[#222222] sm:text-[40px]">
            Những Giá Trị
            <br />
            <span className="text-primary">Học Viên Tìm Thấy</span>
            <br />
            Tại {centerName}
          </h2>
          <div className="mx-auto mt-8 max-w-xs">
            <img
              src={IMAGES.msNhu}
              alt={centerName}
              loading="lazy"
              className="mx-auto w-full max-w-[280px] rounded-2xl object-cover shadow-xl ring-4 ring-white"
            />
          </div>
        </div>

        <div className="mt-10 hidden items-start gap-6 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          {/* Cột trái — lệch xuống */}
          <div className="relative pt-4 xl:pt-8">
            <Mascot
              name="reading"
              className="absolute -left-16 bottom-0 hidden w-36 xl:block 2xl:-left-20 2xl:w-44"
            />
            <ValueColumn items={left} className="flex flex-col gap-6" />
          </div>

          {/* Giữa — title + ảnh */}
          <div className="flex flex-col items-center text-center">
            <h2 className="font-heading text-[40px] font-extrabold leading-tight text-[#222222]">
              Những Giá Trị
              <br />
              <span className="text-primary">Học Viên Tìm Thấy</span>
              <br />
              Tại {centerName}
            </h2>
            <div className="mt-6 w-full max-w-[320px] xl:mt-8">
              <img
                src={IMAGES.msNhu}
                alt={centerName}
                loading="lazy"
                className="w-full rounded-2xl object-cover shadow-2xl ring-4 ring-white"
              />
            </div>
          </div>

          {/* Cột phải — lệch xuống nhiều hơn (stagger IEC) */}
          <ValueColumn items={right} className="flex flex-col gap-6 pt-12 xl:pt-20" />
        </div>

        {/* Cards mobile/tablet */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:hidden">
          {coreValues.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}

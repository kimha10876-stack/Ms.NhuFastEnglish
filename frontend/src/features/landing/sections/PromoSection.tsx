import { cn } from '@/shared/utils/cn'
import { SectionHeading } from '../components/SectionHeading'
import { useLanding } from '../landing.context'
import { PRICE_FROM, PRICE_TAGLINE, promos } from '../landing.data'

export function PromoSection() {
  const { zaloDisplay } = useLanding()

  return (
    <section id="uu-dai" className="bg-white px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Ưu đãi đang áp dụng"
          eyebrowClass="bg-rose-100 text-rose-700"
          title="Đăng ký hôm nay nhận ngay 3 ưu đãi"
          desc={`Học phí chỉ từ ${PRICE_FROM}/giờ học — ${PRICE_TAGLINE.toLowerCase()}.`}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {promos.map(({ icon: Icon, title, desc, tag, bar, tile, badge }) => (
            <div
              key={title}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300"
            >
              <div className={cn('h-1.5 w-full bg-gradient-to-r', bar)} />
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tile)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs', badge)}>{tag}</span>
                </div>
                <h3 className="mb-2 text-lg tracking-tight text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Ưu đãi có thể thay đổi theo từng đợt tuyển sinh — liên hệ hotline {zaloDisplay} để xác nhận.
        </p>
      </div>
    </section>
  )
}

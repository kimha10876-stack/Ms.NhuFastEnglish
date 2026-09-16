import { Mascot } from '../components/Mascot'
import { useLanding } from '../landing.context'
import { IMAGES, PRICE_TAGLINE, trustStats } from '../landing.data'

export function HeroSection() {
  const { centerName, scrollToConsult } = useLanding()

  return (
    <section id="trang-chu" className="relative bg-[#fef9e7]">
      {/* Hero banner */}
      <div className="relative min-h-[480px] overflow-hidden sm:min-h-[540px] lg:min-h-[600px]">
        <img
          src={IMAGES.classGroup}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Overlay trái — tương đương gradient xanh IEC, dùng đen + vàng accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#222222]/95 via-[#222222]/55 to-[#222222]/10" />
        <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary sm:w-2" aria-hidden />

        <div className="relative mx-auto flex h-full min-h-[480px] max-w-7xl items-center px-4 py-16 sm:min-h-[540px] lg:min-h-[600px] lg:px-6 lg:py-20">
          <Mascot
            name="waveHi"
            className="absolute bottom-8 right-4 hidden w-36 sm:block md:w-44 lg:bottom-12 lg:right-8 lg:w-52 xl:w-60"
          />
          <div className="max-w-xl text-left">
            <h1 className="font-heading text-4xl leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Chất Lượng Thật,
              <br />
              Giá Không Tưởng
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              {centerName} tại TP.HCM — phát triển học viên tự tin giao tiếp tiếng Anh qua môi
              trường học hiện đại và tương tác thực tế. {PRICE_TAGLINE}.
            </p>
            <button
              type="button"
              onClick={scrollToConsult}
              className="font-heading mt-8 inline-flex items-center rounded-full bg-primary px-8 py-3.5 text-sm uppercase tracking-wider text-[#333333] transition-colors hover:bg-primary-400"
            >
              Đăng ký nhận ưu đãi
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar — nổi lên từ đáy hero, giống IEC */}
      <div className="relative z-10 -mt-10 px-4 sm:-mt-14 lg:-mt-16 lg:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-t-[2rem] bg-[#222222] shadow-xl sm:rounded-t-[2.5rem]">
          <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {trustStats.map(({ icon: Icon, value, title, desc }) => (
              <div key={title} className="flex gap-4 px-6 py-6 sm:px-8 sm:py-8 lg:py-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-xl text-white sm:text-2xl">{value}</p>
                  <p className="font-heading mt-1 text-sm text-white sm:text-base">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}

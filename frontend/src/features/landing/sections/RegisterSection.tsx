import type { RefObject } from 'react'
import { Mail, Phone } from 'lucide-react'
import { ConsultationForm } from '../ConsultationForm'
import { IecSectionHeader } from '../components/IecSectionHeader'
import { Mascot } from '../components/Mascot'
import { useLanding } from '../landing.context'
import { IMAGES } from '../landing.data'

function MessengerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M22.0498 0C34.4733 0 44.0019 9.07892 44.002 21.3418C44.002 36.8783 29.2621 45.5817 15.6631 41.8389C14.8675 41.6225 14.8068 41.7857 10.1133 43.8525C9.84917 43.9678 9.5608 44.0168 9.27344 43.9951C8.98594 43.9734 8.70779 43.8813 8.46387 43.7275C8.22013 43.5739 8.01758 43.3631 7.87402 43.1133C7.73046 42.8634 7.64962 42.582 7.63965 42.2939C7.51367 38.1803 7.66654 37.7942 6.92578 37.1279C2.63556 33.299 0 27.7558 0 21.3418C9.42193e-05 9.07896 9.62727 5.26025e-05 22.0498 0ZM35.29 16.4238C35.9154 15.4409 34.6996 14.3302 33.7734 15.0381L26.8174 20.3057C26.587 20.4784 26.3065 20.5723 26.0186 20.5723C25.7308 20.5722 25.4509 20.4783 25.2207 20.3057L20.0693 16.4502C19.7036 16.1771 19.2853 15.9818 18.8408 15.8779C18.3964 15.7741 17.9352 15.764 17.4863 15.8467C17.0373 15.9294 16.6098 16.1038 16.2314 16.3594C15.8532 16.6149 15.5315 16.9455 15.2871 17.3311L8.81152 27.584C8.18609 28.5661 9.40115 29.6771 10.3291 28.9736L17.2812 23.7012C17.5116 23.5284 17.7922 23.4346 18.0801 23.4346C18.3679 23.4346 18.6476 23.5285 18.8779 23.7012L24.0312 27.5576C24.397 27.8306 24.8153 28.0251 25.2598 28.1289C25.7042 28.2327 26.1654 28.2438 26.6143 28.1611C27.0633 28.0784 27.4907 27.9039 27.8691 27.6484C28.2474 27.393 28.5689 27.0622 28.8135 26.6768L35.29 16.4238Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function RegisterSection({
  consultRef,
  presetGoal,
}: {
  consultRef: RefObject<HTMLDivElement | null>
  presetGoal: string
}) {
  const { centerName, email, messengerUrl, zaloPhone, zaloDisplay } = useLanding()

  return (
    <section id="lien-he" className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <IecSectionHeader
          eyebrow="Liên hệ & Đăng ký"
          title={`Trung Tâm ${centerName}`}
          desc="Gọi hotline, chat Zalo hoặc để lại thông tin — chúng tôi phản hồi trong giờ làm việc."
        />

        {/* Banner kiểu IEC — mascot trái, liên hệ + form phải */}
        <div className="relative mt-12 overflow-hidden rounded-2xl shadow-xl">
          <img
            src={IMAGES.classPhoto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#222222]/90 via-[#222222]/75 to-[#222222]/50" />

          {/* Góc vàng accent */}
          <div
            className="absolute bottom-0 left-0 h-24 w-2/5 bg-primary/90 sm:h-32"
            style={{ clipPath: 'polygon(0 100%, 100% 0, 0 0)' }}
            aria-hidden
          />

          <div className="relative grid items-end gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-10 lg:p-10">
            {/* Mascot — chỉ tay về form, giống IEC */}
            <Mascot
              name="pointUp"
              className="mx-auto w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[320px]"
              imgClassName="drop-shadow-2xl"
            />

            {/* Liên hệ + form */}
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <a
                  href={`tel:${zaloPhone}`}
                  className="group rounded-xl border border-white/20 bg-white/95 p-4 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                    <Phone className="h-4 w-4 text-primary-800" />
                  </span>
                  <p className="text-xs text-gray-500">Hotline / Zalo</p>
                  <p className="mt-0.5 text-base font-semibold text-gray-900 group-hover:text-primary-800">
                    {zaloDisplay}
                  </p>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="group rounded-xl border border-white/20 bg-white/95 p-4 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                    <Mail className="h-4 w-4 text-primary-800" />
                  </span>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-0.5 break-all text-sm text-gray-900 group-hover:text-primary-800">
                    {email}
                  </p>
                </a>

                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-white/20 bg-white/95 p-4 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-[#2C64F5]">
                    <MessengerIcon />
                  </span>
                  <p className="text-xs text-gray-500">Mess</p>
                  <p className="mt-0.5 text-sm text-gray-900 group-hover:text-[#2C64F5]">Chat Messenger</p>
                </a>
              </div>

              <div
                ref={consultRef}
                className="rounded-xl border border-white/20 bg-white p-6 shadow-lg lg:p-8"
              >
                <h3 className="text-lg text-gray-900">Đăng ký tư vấn miễn phí</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Test đầu vào miễn phí — Ms Nhu liên hệ trực tiếp, không áp lực.
                </p>
                <div className="mt-6">
                  <ConsultationForm presetGoal={presetGoal} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

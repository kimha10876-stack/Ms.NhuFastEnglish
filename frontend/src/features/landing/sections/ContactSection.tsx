import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { LandingButton } from '../LandingButton'
import { SectionHeading } from '../components/SectionHeading'
import { useLanding } from '../landing.context'
import { workingHours } from '../landing.data'

export function ContactSection() {
  const { centerName, email, address, messengerUrl, zaloPhone, zaloDisplay, scrollToConsult } =
    useLanding()

  return (
    <section
      id="lien-he"
      className="border-t border-gray-100 bg-white px-4 py-16 lg:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Liên hệ"
          eyebrowClass="bg-sky-100 text-sky-700"
          title={`Kết nối với ${centerName}`}
          desc="Gọi hotline, chat Zalo hoặc Messenger — chúng tôi phản hồi trong giờ làm việc."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <a
            href={`tel:${zaloPhone}`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#333333] text-white">
              <Phone className="h-5 w-5" />
            </span>
            <p className="text-sm text-gray-500">Hotline / Zalo</p>
            <p className="mt-1 text-lg text-gray-900 group-hover:text-emerald-700">{zaloDisplay}</p>
          </a>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-[#333333]">
              <Clock className="h-5 w-5" />
            </span>
            <p className="text-sm text-gray-500">Thời gian làm việc</p>
            <ul className="mt-2 space-y-1">
              {workingHours.map(({ label, time }) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 text-sm text-gray-700"
                >
                  <span>{label}</span>
                  <span className="text-gray-900">{time}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`mailto:${email}`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#333333]">
              <Mail className="h-5 w-5" />
            </span>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 break-all text-base text-gray-900 group-hover:text-sky-700">{email}</p>
            {address && (
              <p className="mt-3 flex gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                {address}
              </p>
            )}
          </a>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-primary px-6 py-10 text-center lg:px-12">
          <h3 className="text-balance text-2xl tracking-tight text-[#333333]">
            Sẵn sàng bắt đầu hành trình tiếng Anh?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#333333]/75">
            Nhận buổi kiểm tra trình độ và lộ trình học miễn phí — không cam kết, không áp lực.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LandingButton variant="dark" size="lg" onClick={scrollToConsult}>
              Đăng ký tư vấn ngay
            </LandingButton>
            <LandingButton asChild variant="outline" size="lg">
              <a href={messengerUrl} target="_blank" rel="noreferrer">
                Chat Messenger
              </a>
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, Mail, Phone } from 'lucide-react'
import { BrandLogo } from '../components/BrandLogo'
import { useAuthStore } from '@/features/auth/auth.store'
import { useLanding } from '../landing.context'
import { LANDING_CONTACT, PRICE_TAGLINE, courses } from '../landing.data'

function FooterLink({
  children,
  onClick,
  to,
}: {
  children: ReactNode
  onClick?: () => void
  to?: string
}) {
  const className =
    'group inline-flex items-start gap-1.5 text-left text-sm text-gray-700 transition-colors hover:text-[#222222]'

  const inner = (
    <>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
      <span>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

export function LandingFooter() {
  const {
    centerName,
    email,
    address,
    zaloPhone,
    zaloDisplay,
    isLoggedIn,
    scrollToConsult,
    scrollToSection,
  } = useLanding()

  const user = useAuthStore((s) => s.user)
  const isStudent = user?.roles.includes('Student') ?? false
  const isStaff =
    user?.roles.some((role) => role === 'Teacher' || role === 'Admin') ?? false

  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-black/5 bg-[#fffdf5] text-[#222222]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <BrandLogo alt={centerName} className="h-14 w-14 text-lg" />
              <div className="leading-tight">
                <span className="font-heading block text-lg font-extrabold">Ms Nhu</span>
                <span className="block text-xs text-gray-500">{PRICE_TAGLINE}</span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              Trung tâm tiếng Anh tại {LANDING_CONTACT.city} — lộ trình cá nhân hóa từ mất gốc đến
              luyện thi IELTS, TOEIC. 100% giáo viên nước ngoài cho lớp giao tiếp và Speaking.
            </p>
          </div>

          {/* Chương trình */}
          <div>
            <p className="font-heading mb-4 text-base font-extrabold">Chương trình học</p>
            <ul className="space-y-2.5">
              {courses.map(({ name, slug }) => (
                <li key={slug}>
                  <FooterLink to={`/khoa-hoc/${slug}`}>Khóa học {name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <p className="font-heading mb-4 text-base font-extrabold">Thông tin liên hệ</p>
            <div className="space-y-5">
              <div>
                <div className="flex gap-2">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#222222]" />
                  <p className="text-sm leading-relaxed text-gray-700">
                    <span className="font-semibold text-[#222222]">Cơ sở {LANDING_CONTACT.city}:</span>{' '}
                    {address || LANDING_CONTACT.cityLabel}
                  </p>
                </div>
                <a
                  href={`tel:${zaloPhone}`}
                  className="font-heading mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-[#333333] transition-colors hover:bg-primary-400"
                >
                  <Phone className="h-4 w-4" />
                  {zaloDisplay}
                </a>
              </div>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#222222]"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {email}
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-heading mb-4 text-base font-extrabold">Tìm hiểu thêm tại</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('gioi-thieu')}
                  className="hover:text-[#222222]"
                >
                  Giới thiệu
                </button>
              </li>
              <li>
                <Link to="/khoa-hoc" className="hover:text-[#222222]">
                  Chương trình học
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('giao-vien')}
                  className="hover:text-[#222222]"
                >
                  Giáo viên
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('lien-he')}
                  className="hover:text-[#222222]"
                >
                  Liên hệ
                </button>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#222222]">
                  Tin tức
                </Link>
              </li>
              <li>
                <button type="button" onClick={scrollToConsult} className="hover:text-[#222222]">
                  Đăng ký tư vấn
                </button>
              </li>
              {isLoggedIn && isStudent && (
                <li>
                  <Link to="/dashboard" className="hover:text-[#222222]">
                    Vào lớp học
                  </Link>
                </li>
              )}
              {isLoggedIn && isStaff && (
                <li>
                  <Link to="/dashboard" className="hover:text-[#222222]">
                    Hệ thống
                  </Link>
                </li>
              )}
            </ul>

            <p className="mt-6 text-xs text-gray-500 lg:hidden">
              © {year} {centerName}. All rights reserved.
            </p>
          </div>
        </div>

        <p className="mt-10 hidden text-xs text-gray-500 lg:block">
          © {year} {centerName}. All rights reserved.
        </p>
      </div>

      <div className="bg-[#222222] py-3 text-center text-xs text-white/80">
        Copyright {year} © {centerName}. Ms Nhu Fast English — TP.HCM
      </div>
    </footer>
  )
}

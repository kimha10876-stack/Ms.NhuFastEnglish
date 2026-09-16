import { useEffect, useRef, useState } from 'react'

import { Link, useLocation } from 'react-router-dom'

import { ChevronDown, Menu, PenLine, X } from 'lucide-react'

import { cn } from '@/shared/utils/cn'

import { BrandLogo } from '../components/BrandLogo'

import { useActiveLandingNav } from '../hooks/useActiveLandingNav'

import { useLanding } from '../landing.context'

import { NAV_LINK_CLASS, navLinkActiveClass, type LandingNavId } from '../landing.nav'

import { PRICE_TAGLINE, courses } from '../landing.data'



function CoursesMenu({

  onNavigate,

  active,

  isHome,

}: {

  onNavigate?: () => void

  active: boolean

  isHome: boolean

}) {

  const { scrollToSection } = useLanding()

  const menuRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)



  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {

        setOpen(false)

      }

    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)

  }, [])



  const close = () => {

    setOpen(false)

    onNavigate?.()

  }



  return (

    <div

      ref={menuRef}

      className="relative"

      onMouseEnter={() => setOpen(true)}

      onMouseLeave={() => setOpen(false)}

    >

      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md',
          active ? 'bg-[#f8cd0a] px-2 py-1' : ''
        )}
      >
        {isHome ? (
          <button
            type="button"
            onClick={() => {
              scrollToSection('khoa-hoc')
              close()
            }}
            className={
              active
                ? 'whitespace-nowrap px-1 py-1 font-body text-sm font-bold text-[#333333]'
                : NAV_LINK_CLASS
            }
          >
            Chương trình học
          </button>
        ) : (
          <Link
            to="/khoa-hoc"
            onClick={close}
            className={
              active
                ? 'whitespace-nowrap px-1 py-1 font-body text-sm font-bold text-[#333333]'
                : NAV_LINK_CLASS
            }
          >
            Chương trình học
          </Link>
        )}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Mở menu chương trình"
          className={cn(
            'rounded p-1 text-[#333333] transition-colors hover:text-[#222222]',
            active && 'font-bold'
          )}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (

        <div className="absolute left-0 top-full z-50 min-w-[280px] pt-2 lg:left-1/2 lg:-translate-x-1/2">

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">

            {courses.map(({ name, level, slug }) => (

              <Link

                key={slug}

                to={`/khoa-hoc/${slug}`}

                onClick={close}

                className="block px-4 py-2.5 font-body text-sm text-gray-700 transition-colors hover:bg-[#fef9e7] hover:text-primary-700"

              >

                <span className="block font-medium text-gray-900">{name}</span>

                <span className="block text-xs text-gray-500">{level}</span>

              </Link>

            ))}

            <div className="my-1 border-t border-gray-100" />

            <Link

              to="/khoa-hoc"

              onClick={close}

              className="block px-4 py-2 text-left font-body text-sm text-primary-700 hover:bg-[#fef9e7]"

            >

              Xem tất cả chương trình

            </Link>

          </div>

        </div>

      )}

    </div>

  )

}



export function LandingHeader() {

  const { centerName, scrollToConsult, scrollToSection, scrollToTop } = useLanding()

  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)



  const isHome = location.pathname === '/'

  const scrollActive = useActiveLandingNav(isHome)

  const activeNav: LandingNavId = location.pathname.startsWith('/blog')

    ? 'tin-tuc'

    : location.pathname.startsWith('/khoa-hoc')

      ? 'khoa-hoc'

      : scrollActive



  const navItemClass = (id: LandingNavId) => cn(NAV_LINK_CLASS, navLinkActiveClass(activeNav === id))



  const nav = (onNavigate?: () => void) => (

    <>

      <button

        type="button"

        onClick={() => {

          scrollToTop()

          onNavigate?.()

        }}

        className={navItemClass('home')}

      >

        Trang chủ

      </button>

      <button

        type="button"

        onClick={() => {

          scrollToSection('gioi-thieu')

          onNavigate?.()

        }}

        className={navItemClass('gioi-thieu')}

      >

        Giới thiệu

      </button>

      <CoursesMenu onNavigate={onNavigate} active={activeNav === 'khoa-hoc'} isHome={isHome} />

      <button

        type="button"

        onClick={() => {

          scrollToSection('giao-vien')

          onNavigate?.()

        }}

        className={navItemClass('giao-vien')}

      >

        Giáo viên

      </button>

      <button

        type="button"

        onClick={() => {

          scrollToSection('lien-he')

          onNavigate?.()

        }}

        className={navItemClass('lien-he')}

      >

        Liên hệ

      </button>

      <Link to="/blog" onClick={onNavigate} className={navItemClass('tin-tuc')}>

        Tin tức

      </Link>

    </>

  )



  return (

    <header className="sticky top-0 z-50 bg-white shadow-sm">

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6 lg:py-4">

        <Link to="/" className="flex min-w-0 items-center gap-3">

          <BrandLogo alt={centerName} className="h-11 w-11 text-sm lg:h-12 lg:w-12" />

          <div className="min-w-0 leading-tight">

            <span className="font-heading block truncate text-base text-[#333333] lg:text-lg">

              Ms Nhu

            </span>

            <span className="block truncate font-body text-[11px] text-gray-500 lg:text-xs">

              {PRICE_TAGLINE}

            </span>

          </div>

        </Link>



        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">{nav()}</nav>



        <div className="flex items-center gap-2">

          <button

            type="button"

            onClick={scrollToConsult}

            className="font-heading hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-wide text-[#333333] transition-colors hover:bg-primary-400 sm:inline-flex"

          >

            <PenLine className="h-4 w-4" />

            Đăng ký ngay

          </button>

          <button

            type="button"

            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 lg:hidden"

            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}

            onClick={() => setMobileOpen((o) => !o)}

          >

            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

          </button>

        </div>

      </div>



      {mobileOpen && (

        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 font-body lg:hidden">

          {nav(() => setMobileOpen(false))}

          <button

            type="button"

            onClick={() => {

              scrollToConsult()

              setMobileOpen(false)

            }}

            className="font-heading mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs uppercase tracking-wide text-[#333333] hover:bg-primary-400"

          >

            <PenLine className="h-4 w-4" />

            Đăng ký ngay

          </button>

        </nav>

      )}

    </header>

  )

}



import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { useSystemSettings } from '@/features/settings/useSettings'
import type { LandingContextValue } from './landing.context'
import { courses, LANDING_CONTACT, settingValue } from './landing.data'

type LandingContextOverrides = Partial<
  Pick<LandingContextValue, 'scrollToConsult' | 'scrollToSection' | 'scrollToTop' | 'pickCourse'>
>

export function useLandingContextValue(overrides?: LandingContextOverrides): LandingContextValue {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: settings } = useSystemSettings()

  const scrollToSectionDefault = useCallback(
    (id: string) => {
      navigate(`/#${id}`)
    },
    [navigate]
  )

  const scrollToConsultDefault = useCallback(() => {
    navigate('/#lien-he')
  }, [navigate])

  const scrollToTopDefault = useCallback(() => {
    navigate('/')
  }, [navigate])

  const pickCourseDefault = useCallback(
    (name: string) => {
      const course = courses.find((c) => c.name === name)
      navigate(course ? `/khoa-hoc/${course.slug}` : '/khoa-hoc')
    },
    [navigate]
  )

  return useMemo(() => {
    const messengerUrl =
      settingValue(settings, 'FacebookUrl', LANDING_CONTACT.messengerUrl) ||
      LANDING_CONTACT.messengerUrl

    return {
      centerName: settingValue(settings, 'CenterName', 'Ms Nhu Fast English'),
      email: settingValue(settings, 'Email', LANDING_CONTACT.email),
      address: settingValue(settings, 'Address', LANDING_CONTACT.cityLabel),
      messengerUrl,
      zaloPhone: LANDING_CONTACT.zaloPhone,
      zaloDisplay: LANDING_CONTACT.zaloDisplay,
      isLoggedIn: !!user,
      isStudent: user?.roles.includes('Student') ?? false,
      scrollToConsult: overrides?.scrollToConsult ?? scrollToConsultDefault,
      scrollToSection: overrides?.scrollToSection ?? scrollToSectionDefault,
      scrollToTop: overrides?.scrollToTop ?? scrollToTopDefault,
      pickCourse: overrides?.pickCourse ?? pickCourseDefault,
    }
  }, [
    settings,
    user,
    overrides?.scrollToConsult,
    overrides?.scrollToSection,
    overrides?.scrollToTop,
    overrides?.pickCourse,
    scrollToConsultDefault,
    scrollToSectionDefault,
    scrollToTopDefault,
    pickCourseDefault,
  ])
}

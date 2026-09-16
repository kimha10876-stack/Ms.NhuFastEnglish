import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandingProvider } from './landing.context'
import { useLandingContextValue } from './useLandingContextValue'
import { courses } from './landing.data'
import { FloatingActions } from './components/FloatingActions'
import { LandingHeader } from './sections/LandingHeader'
import { HeroSection } from './sections/HeroSection'
import { AboutSection } from './sections/AboutSection'
import { CoursesSection } from './sections/CoursesSection'
import { CoreValuesSection } from './sections/CoreValuesSection'
import { HallOfFameSection } from './sections/HallOfFameSection'
import { TeachersSection } from './sections/TeachersSection'
import { GallerySection } from './sections/GallerySection'
import { BlogSection } from './sections/BlogSection'
import { RegisterSection } from './sections/RegisterSection'
import { LandingFooter } from './sections/LandingFooter'

export default function LandingPage() {
  const navigate = useNavigate()
  const consultRef = useRef<HTMLDivElement>(null)
  const [presetGoal, setPresetGoal] = useState('')

  const scrollToConsult = useCallback(() => {
    document.getElementById('lien-he')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => {
      consultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
  }, [])

  const pickCourse = useCallback(
    (name: string) => {
      const course = courses.find((c) => c.name === name)
      if (course) navigate(`/khoa-hoc/${course.slug}`)
    },
    [navigate]
  )

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  const context = useLandingContextValue(
    useMemo(
      () => ({
        scrollToConsult,
        scrollToSection: (id: string) =>
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
        scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        pickCourse,
      }),
      [scrollToConsult, pickCourse]
    )
  )

  return (
    <LandingProvider value={context}>
      <div className="landing-page flex min-h-svh flex-col">
        <LandingHeader />
        <HeroSection />
        <AboutSection />
        <CoreValuesSection />
        <CoursesSection />
        <HallOfFameSection />
        <TeachersSection />
        <GallerySection />
        <RegisterSection consultRef={consultRef} presetGoal={presetGoal} />
        <BlogSection />
        <LandingFooter />
        <FloatingActions />
      </div>
    </LandingProvider>
  )
}

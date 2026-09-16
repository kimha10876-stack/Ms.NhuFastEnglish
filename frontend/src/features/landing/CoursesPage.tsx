import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { LandingProvider, useLanding } from './landing.context'
import { useLandingContextValue } from './useLandingContextValue'
import { LandingLayout } from './LandingLayout'
import { IecSectionHeader } from './components/IecSectionHeader'
import { CourseHeroBanner, CourseRoadmapBlock } from './sections/CourseDetailBlocks'
import { HallOfFameSection } from './sections/HallOfFameSection'
import { BlogSection } from './sections/BlogSection'
import { RegisterSection } from './sections/RegisterSection'
import { courses, getCourseBySlug } from './landing.data'

function CourseProgramsContent({ slug }: { slug?: string }) {
  const { centerName } = useLanding()
  const activeCourse = slug ? getCourseBySlug(slug) : undefined
  const displayCourses = activeCourse ? [activeCourse] : courses

  return (
    <>
      <section className="bg-[#fef9e7] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {!activeCourse && (
            <IecSectionHeader
              eyebrow={`Chương trình học tại ${centerName}`}
              eyebrowPill
              align="left"
              title="Học Đúng Mục Tiêu –"
              titleHighlight="Phát Triển Toàn Diện"
              desc="Lộ trình khoa học từ mất gốc đến luyện thi — chọn chương trình phù hợp và đăng ký tư vấn miễn phí."
              className="max-w-3xl"
            />
          )}

          <div className={activeCourse ? 'space-y-0' : 'mt-10 space-y-16'}>
            {displayCourses.map((course, index) => (
              <article key={course.slug} id={`khoa-${course.slug}`} className="scroll-mt-24">
                <CourseHeroBanner course={course} />
                <CourseRoadmapBlock course={course} imageRight={index % 2 === 1} />
              </article>
            ))}
          </div>

          {activeCourse && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
              <p className="font-heading text-lg font-extrabold text-[#222222]">
                Khám phá thêm chương trình khác
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {courses
                  .filter((c) => c.slug !== activeCourse.slug)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      to={`/khoa-hoc/${c.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#fef9e7] px-4 py-2 text-sm text-gray-700 transition-colors hover:border-primary hover:text-primary-800"
                    >
                      {c.name}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                <Link
                  to="/khoa-hoc"
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-[#333333] hover:bg-primary-400"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <HallOfFameSection />
      <BlogSection />
    </>
  )
}

export default function CoursesPage() {
  const { slug } = useParams<{ slug?: string }>()
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
      if (course) {
        setPresetGoal(`Tôi muốn tìm hiểu khóa ${course.name}`)
        navigate(`/khoa-hoc/${course.slug}`)
      }
    },
    [navigate]
  )

  const context = useLandingContextValue(
    useMemo(
      () => ({
        scrollToConsult,
        scrollToSection: (id: string) => navigate(`/#${id}`),
        scrollToTop: () => navigate('/'),
        pickCourse,
      }),
      [scrollToConsult, pickCourse, navigate]
    )
  )

  useEffect(() => {
    if (!slug) return
    const course = getCourseBySlug(slug)
    if (!course) return

    setPresetGoal(`Tôi muốn tìm hiểu khóa ${course.name}`)
    requestAnimationFrame(() => {
      document.getElementById(`khoa-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [slug])

  if (slug && !getCourseBySlug(slug)) {
    return <Navigate to="/khoa-hoc" replace />
  }

  return (
    <LandingProvider value={context}>
      <LandingLayout>
        <CourseProgramsContent slug={slug} />
        <RegisterSection consultRef={consultRef} presetGoal={presetGoal} />
      </LandingLayout>
    </LandingProvider>
  )
}

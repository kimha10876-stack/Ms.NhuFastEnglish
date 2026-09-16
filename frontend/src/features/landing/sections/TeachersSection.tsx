import { Award } from 'lucide-react'
import { useLanding } from '../landing.context'
import { teacherCategories } from '../landing.data'

function CategoryCard({ title, desc, photo }: { title: string; desc: string; photo: string }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/[0.04]">
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#222222] text-primary">
        <Award className="h-4 w-4" strokeWidth={2.25} />
      </span>

      <h3 className="font-heading pr-10 text-lg font-extrabold text-[#222222]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{desc}</p>

      <div className="mt-4 aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
        <img src={photo} alt={title} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
    </article>
  )
}

export function TeachersSection() {
  const { centerName } = useLanding()

  return (
    <section id="giao-vien" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Intro */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-xl font-extrabold uppercase tracking-wide text-[#222222] sm:text-2xl lg:text-[28px]">
            Giáo viên không chỉ dạy tiếng Anh
          </h2>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base">
            <p>
              Tại {centerName}, giáo viên là người hướng dẫn, khơi gợi sự tò mò và tạo môi trường để
              học viên mạnh dạn sử dụng tiếng Anh — online hay offline tại TP.HCM.
            </p>
            <p>
              Mỗi buổi học được thiết kế để học viên được nói nhiều hơn, đặt câu hỏi, làm việc nhóm
              và ứng dụng kiến thức vào tình huống thực tế.
            </p>
          </div>

          <blockquote className="font-heading mt-8 text-lg font-extrabold italic leading-snug text-[#222222] sm:text-xl">
            &ldquo;Dạy để học viên hiểu –{' '}
            <span className="text-primary not-italic">
              truyền cảm hứng để học viên muốn tiến xa hơn.&rdquo;
            </span>
          </blockquote>
        </div>

        {/* Title giữa */}
        <h2 className="font-heading mx-auto mt-16 max-w-3xl text-center text-[28px] font-extrabold leading-tight sm:mt-20 sm:text-[40px]">
          <span className="text-[#222222]">Đúng Giáo Viên – </span>
          <span className="text-primary">Đúng Lộ Trình</span>
        </h2>

        {/* 4 card danh mục */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {teacherCategories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </div>
    </section>
  )
}

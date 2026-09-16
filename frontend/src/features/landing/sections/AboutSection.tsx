import { Mascot } from '../components/Mascot'
import { useLanding } from '../landing.context'
import { IMAGES, LANDING_CONTACT, PRICE_FROM, PRICE_TAGLINE } from '../landing.data'

const aboutGallery = [
  { src: IMAGES.classPhoto, alt: 'Không gian lớp học tại trung tâm' },
  { src: IMAGES.classForeignTeacher, alt: 'Giáo viên nước ngoài cùng học viên' },
  { src: IMAGES.classGroup, alt: 'Lớp học nhóm tại TP.HCM' },
  { src: IMAGES.examSelfie, alt: 'Học viên tại Ms Nhu Fast English' },
] as const

export function AboutSection() {
  const { centerName } = useLanding()

  return (
    <section id="gioi-thieu" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Trái — nội dung */}
          <div>
            <h2 className="font-heading text-[28px] font-extrabold leading-tight text-[#222222] sm:text-[40px]">
              {centerName} – Nơi hành trình tiếng Anh bắt đầu
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base">
              <p>
                {centerName} xây dựng môi trường học tiếng Anh gần gũi, năng động và có lộ trình rõ
                ràng cho từng mục tiêu — từ mất gốc, giao tiếp đến luyện thi IELTS, TOEIC tại{' '}
                {LANDING_CONTACT.city}.
              </p>
              <p>
                Từ những bước đầu tiên đến các mục tiêu band IELTS, chứng chỉ TOEIC và tự tin giao
                tiếp, chúng tôi đồng hành cùng học viên bằng lớp nhỏ, giáo viên nước ngoài và học phí
                minh bạch chỉ từ {PRICE_FROM}/giờ — {PRICE_TAGLINE.toLowerCase()}.
              </p>
            </div>

            <div className="relative mt-10">
              <blockquote className="font-heading text-2xl font-extrabold leading-snug text-[#222222] sm:text-3xl lg:text-[2rem]">
                <span className="text-primary">&ldquo;</span>
                Chất Lượng Thật,{' '}
                <span className="text-primary">Giá Không Tưởng</span>
                <span className="text-primary">&rdquo;</span>
              </blockquote>
              <Mascot
                name="letsLearn"
                className="absolute -right-2 -top-16 hidden w-32 sm:block lg:-right-8 lg:-top-20 lg:w-40"
              />
            </div>
          </div>

          {/* Phải — lưới ảnh 2×2 */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {aboutGallery.map(({ src, alt }) => (
              <div key={src} className="aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

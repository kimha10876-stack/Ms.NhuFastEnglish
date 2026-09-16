import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { SectionHeading } from '../components/SectionHeading'
import { faqs } from '../landing.data'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="cau-hoi" className="border-t border-gray-100 bg-white px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Câu hỏi thường gặp"
          title="Bạn đang thắc mắc điều gì?"
          desc="Nếu chưa có câu trả lời bạn cần, gọi hotline hoặc để lại thông tin — Ms Nhu sẽ giải đáp trực tiếp."
        />

        <div className="mt-10 space-y-3">
          {faqs.map(({ q, a }, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={q}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-colors',
                  isOpen ? 'border-primary-400 bg-primary-50/50' : 'border-gray-200 bg-white'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="flex-1 text-sm text-gray-900 sm:text-base">{q}</span>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                      isOpen ? 'bg-primary-500 text-[#333333]' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

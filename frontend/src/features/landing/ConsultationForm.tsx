import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { LandingButton } from './LandingButton'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'
import { useCreateConsultation } from '@/features/consultations/useConsultation'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isVietnamesePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('84')) return /^84[3-9]\d{8}$/.test(digits)
  return /^0[3-9]\d{8}$/.test(digits)
}

function apiErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    'Gửi yêu cầu thất bại. Vui lòng thử lại.'
  )
}

const fieldClass =
  'h-10 rounded-xl border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25'

const errorFieldClass = 'border-red-500 focus:border-red-500 focus:ring-red-500/20'

interface ConsultationFormProps {
  presetGoal?: string
}

export function ConsultationForm({ presetGoal = '' }: ConsultationFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const { mutate: registerConsultation, isPending } = useCreateConsultation()

  useEffect(() => {
    if (presetGoal) setMessage(presetGoal)
  }, [presetGoal])

  const clearFieldError = (key: keyof typeof errors) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const next: typeof errors = {}
    if (!fullName.trim()) next.fullName = 'Họ tên không được để trống'
    if (!phone.trim()) {
      next.phone = 'Số điện thoại không được để trống'
    } else if (!isVietnamesePhone(phone)) {
      next.phone = 'Số điện thoại Việt Nam không hợp lệ (vd: 0905123456)'
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      next.email = 'Email không đúng định dạng'
    }

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    registerConsultation(
      {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
          setFullName('')
          setPhone('')
          setEmail('')
          setMessage('')
          setErrors({})
        },
        onError: (err) => setSubmitError(apiErrorMessage(err)),
      }
    )
  }

  if (successMessage) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="mb-1 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Gửi yêu cầu thành công!
        </p>
        <p className="text-xs leading-relaxed text-emerald-700">{successMessage}</p>
        <LandingButton
          size="sm"
          variant="primary"
          className="mt-4"
          onClick={() => setSuccessMessage('')}
        >
          Gửi yêu cầu khác
        </LandingButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="form-fullname" className="mb-1.5 block text-xs text-gray-600">
          Họ và tên <span className="text-red-600">*</span>
        </label>
        <Input
          id="form-fullname"
          type="text"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            clearFieldError('fullName')
          }}
          className={cn(fieldClass, errors.fullName && errorFieldClass)}
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="form-phone" className="mb-1.5 block text-xs text-gray-600">
          Số điện thoại <span className="text-red-600">*</span>
        </label>
        <Input
          id="form-phone"
          type="tel"
          inputMode="tel"
          placeholder="0905123456"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            clearFieldError('phone')
          }}
          className={cn(fieldClass, errors.phone && errorFieldClass)}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="form-email" className="mb-1.5 block text-xs text-gray-600">
          Email <span className="text-gray-400">(Không bắt buộc)</span>
        </label>
        <Input
          id="form-email"
          type="email"
          placeholder="nguyenvana@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearFieldError('email')
          }}
          className={cn(fieldClass, errors.email && errorFieldClass)}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="form-message" className="mb-1.5 block text-xs text-gray-600">
          Mục tiêu học tập <span className="text-gray-400">(Không bắt buộc)</span>
        </label>
        <textarea
          id="form-message"
          rows={3}
          placeholder="Ví dụ: Học tiếng Anh giao tiếp đi làm, Luyện thi IELTS 6.5..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
        />
      </div>

      <LandingButton type="submit" disabled={isPending} size="full">
        {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
      </LandingButton>
    </form>
  )
}

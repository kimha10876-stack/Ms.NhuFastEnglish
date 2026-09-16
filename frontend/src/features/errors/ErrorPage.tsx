import { useNavigate } from 'react-router-dom'
import { LandingErrorPage } from './LandingErrorPage'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <LandingErrorPage
      code="Oops"
      title="Đã có lỗi xảy ra"
      description="Hệ thống gặp sự cố tạm thời. Bạn thử tải lại trang hoặc quay về trang chủ — chúng tôi sẽ sớm khắc phục."
      mascot="waveHi"
      onRetry={() => navigate(0)}
    />
  )
}

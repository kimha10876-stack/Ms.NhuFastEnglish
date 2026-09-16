import { LandingErrorPage } from './LandingErrorPage'

export default function NotFoundPage() {
  return (
    <LandingErrorPage
      code="404"
      title="Trang không tồn tại"
      description="Có thể đường dẫn đã đổi, bài viết đã gỡ hoặc bạn gõ nhầm URL. Quay về trang chủ để tiếp tục khám phá Ms Nhu Fast English nhé!"
      mascot="letsLearn"
    />
  )
}

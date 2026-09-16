import { Component, type ErrorInfo, type ReactNode } from 'react'
import { LandingErrorPage } from '@/features/errors/LandingErrorPage'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <LandingErrorPage
          code="Oops"
          title="Đã có lỗi xảy ra"
          description="Ứng dụng gặp lỗi không mong muốn. Thử tải lại trang hoặc quay về trang chủ."
          mascot="thumbsUp"
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

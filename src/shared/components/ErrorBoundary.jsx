/**
 * ErrorBoundary Component
 * - React 에러를 잡아서 fallback UI 표시
 * - 전체 앱이 다운되는 것을 방지
 */

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })

    // 추후 에러 로깅 서비스에 전송 (Sentry, LogRocket 등)
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // fallback prop이 제공되면 사용, 아니면 기본 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return this.props.children
    }

    return this.props.children
  }
}

export default ErrorBoundary

/**
 * ErrorFallback Component
 * - ErrorBoundary에서 사용하는 에러 화면
 */

import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './ErrorFallback.module.scss'

export const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    if (resetError) resetError()
    navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h1 className={styles.title}>문제가 발생했습니다</h1>
        <p className={styles.message}>
          예상치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className={styles.errorDetails}>
            <summary>오류 상세 정보 (개발 모드)</summary>
            <pre className={styles.errorStack}>
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className={styles.actions}>
          <button onClick={handleGoHome} className={styles.primaryButton}>
            홈으로 이동
          </button>
          <button onClick={handleReload} className={styles.secondaryButton}>
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback

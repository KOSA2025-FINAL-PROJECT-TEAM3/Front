/**
 * ServerError Page (500)
 * - 서버 오류 발생 시 표시
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './ErrorPage.module.scss'

export const ServerError = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h1 className={styles.errorCode}>500</h1>
        <h2 className={styles.errorTitle}>서버 오류가 발생했습니다</h2>
        <p className={styles.errorMessage}>
          요청을 처리하는 중 예기치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도하거나 관리자에게 문의해 주세요.
        </p>

        <div className={styles.actions}>
          <Button onClick={() => navigate(ROUTE_PATHS.root)} variant="primary">
            홈으로 이동
          </Button>
          <Button onClick={() => window.location.reload()} variant="secondary">
            페이지 새로고침
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServerError


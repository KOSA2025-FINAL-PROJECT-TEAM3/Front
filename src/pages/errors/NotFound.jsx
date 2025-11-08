/**
 * NotFound Page (404)
 * - 요청한 페이지를 찾을 수 없을 때 표시
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@components/common'
import styles from './ErrorPage.module.css'

/**
 * 404 에러 페이지
 * @returns {JSX.Element} 404 에러 페이지
 */
export const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.errorTitle}>페이지를 찾을 수 없습니다</h2>
        <p className={styles.errorMessage}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div className={styles.actions}>
          <Button onClick={() => navigate('/')} variant="primary">
            홈으로 이동
          </Button>
          <Button onClick={() => navigate(-1)} variant="secondary">
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound

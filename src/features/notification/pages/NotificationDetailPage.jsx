/**
 * 알림 상세 페이지
 * @page 34-notification-detail
 * @component NotificationDetailPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './NotificationDetailPage.module.scss'

/**
 * 알림 상세 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const NotificationDetailPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>알림 상세</h1>
        <p className={styles.placeholder}>알림 상세 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default NotificationDetailPage

/**
 * 알림 목록 페이지
 * @page 33-notifications
 * @component NotificationPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './NotificationPage.module.scss'

/**
 * 알림 목록 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const NotificationPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>알림</h1>
        <p className={styles.placeholder}>알림 목록 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default NotificationPage

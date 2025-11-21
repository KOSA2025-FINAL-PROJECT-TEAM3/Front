/**
 * 알림 상세 페이지
 * @page 34-notification-detail
 * @component NotificationDetailPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Card } from '@shared/components/ui/Card'
import { BackButton } from '@shared/components/ui/BackButton'
import styles from './NotificationDetailPage.module.scss'

import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications'

const MOCK_NOTIFICATION = {
  ...MOCK_NOTIFICATIONS[0],
  date: new Date(MOCK_NOTIFICATIONS[0].createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }),
  content: MOCK_NOTIFICATIONS[0].message,
}

export const NotificationDetailPage = () => {
  // const { id } = useParams()
  // 실제로는 id를 이용해 데이터를 조회하겠지만, 여기서는 Mock Data 사용

  return (
    <MainLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <BackButton />
          <h1 className={styles.title}>알림 상세</h1>
        </header>

        <Card className={styles.contentCard}>
          <div className={styles.metaInfo}>
            <span className={`${styles.typeBadge} ${styles.medication}`}>
              {MOCK_NOTIFICATION.type === 'MEDICATION_REMINDER' ? '복용 알림' : '알림'}
            </span>
            <span className={styles.date}>{MOCK_NOTIFICATION.date}</span>
          </div>

          <h2 className={styles.notiTitle}>{MOCK_NOTIFICATION.title}</h2>

          <div className={styles.divider} />

          <p className={styles.bodyText}>
            {MOCK_NOTIFICATION.content}
          </p>
        </Card>
      </div>
    </MainLayout>
  )
}

export default NotificationDetailPage

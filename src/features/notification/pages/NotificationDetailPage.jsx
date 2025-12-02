/**
 * 알림 상세 페이지
 * @page 34-notification-detail
 * @component NotificationDetailPage
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { Card } from '@shared/components/ui/Card'
import { BackButton } from '@shared/components/ui/BackButton'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import styles from './NotificationDetailPage.module.scss'

export const NotificationDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notifications, markAsRead } = useNotificationStore()

  // ID로 알림 조회
  const notification = useMemo(() => {
    return notifications.find((n) => n.id === Number(id))
  }, [notifications, id])

  useEffect(() => {
    // 알림이 없으면 목록으로 리다이렉트
    if (!notification) {
      navigate(-1)
    }

    // 상세 페이지 진입 시 읽음 처리
    if (notification && !notification.read) {
      markAsRead(notification.id)
    }
  }, [notification, navigate, markAsRead])

  if (!notification) {
    return (
      <MainLayout>
        <div className={styles.container}>
          <header className={styles.header}>
            <BackButton />
            <h1 className={styles.title}>알림 상세</h1>
          </header>
          <p className={styles.emptyText}>알림을 찾을 수 없습니다.</p>
        </div>
      </MainLayout>
    )
  }

  const formattedDate = new Date(notification.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  const getTypeBadgeText = (type) => {
    switch (type) {
      case 'medication.logged':
        return '복용 알림'
      case 'medication.missed':
        return '미복용 알림'
      default:
        return '알림'
    }
  }

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
              {getTypeBadgeText(notification.type)}
            </span>
            <span className={styles.date}>{formattedDate}</span>
          </div>

          <h2 className={styles.notiTitle}>{notification.title}</h2>

          <div className={styles.divider} />

          <p className={styles.bodyText}>
            {notification.message}
          </p>
        </Card>
      </div>
    </MainLayout>
  )
}

export default NotificationDetailPage

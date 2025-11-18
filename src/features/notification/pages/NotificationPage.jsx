/**
 * 알림 목록 페이지
 * @page 33-notifications
 * @component NotificationPage
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/ui/BackButton'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './NotificationPage.module.scss'

/**
 * 알림 목록 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const NotificationPage = () => {
  const navigate = useNavigate()
  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    navigate(ROUTE_PATHS.notificationDetail.replace(':id', notification.id))
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDelete = (e, notificationId) => {
    e.stopPropagation()
    if (window.confirm('이 알림을 삭제하시겠습니까?')) {
      removeNotification(notificationId)
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
      return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      return notificationDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      })
    }
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>알림</h1>
        </div>

        {unreadCount > 0 && (
          <div className={styles.actions}>
            <button type="button" className={styles.markAllButton} onClick={handleMarkAllAsRead}>
              모두 읽음 표시
            </button>
          </div>
        )}

        {loading && <p className={styles.placeholder}>알림을 불러오는 중...</p>}

        {!loading && notifications.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>🔔</p>
            <p className={styles.emptyText}>새로운 알림이 없습니다</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles.notificationHeader}>
                  <span className={styles.notificationTitle}>{notification.title}</span>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => handleDelete(e, notification.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <div className={styles.notificationFooter}>
                  <span className={styles.notificationTime}>{formatDate(notification.createdAt)}</span>
                  {!notification.read && <span className={styles.unreadBadge}>새 알림</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default NotificationPage

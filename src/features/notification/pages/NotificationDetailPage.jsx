/**
 * 알림 상세 페이지
 * @page 34-notification-detail
 * @component NotificationDetailPage
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { Card } from '@shared/components/ui/Card'
import { BackButton } from '@shared/components/ui/BackButton'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'
import styles from './NotificationDetailPage.module.scss'

const formatScheduledTime = (value) => {
  if (!value) return null
  if (typeof value === 'string' && value.length <= 8 && value.includes(':')) {
    return value.slice(0, 5)
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const buildMissedSummary = (missedMedications = [], missedCount) => {
  if (Array.isArray(missedMedications) && missedMedications.length > 0) {
    const first = missedMedications[0]?.medicationName || '약'
    return missedMedications.length > 1 ? `${first} 외 ${missedMedications.length - 1}개` : first
  }
  if (missedCount) {
    return `약 ${missedCount}건`
  }
  return null
}

export const NotificationDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { notifications, markAsRead } = useNotificationStore()
  const [fetchedMeds, setFetchedMeds] = useState([])
  const [fetching, setFetching] = useState(false)

  // 1. location.state에서 전달된 notification 우선 사용
  // 2. 없으면 store에서 조회 (새로고침 시)
  const notification = useMemo(() => {
    const fromState = location.state?.notification
    if (fromState && (String(fromState.id) === String(id) || fromState.groupKey === id)) {
      return fromState
    }
    return notifications.find((n) => String(n.id) === String(id) || n.groupKey === id)
  }, [location.state, notifications, id])

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

  const formattedDate = useMemo(() => {
    if (!notification) return null
    return new Date(notification.createdAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }, [notification])

  const isMissed = useMemo(
    () => (notification?.type || '').toLowerCase().includes('missed'),
    [notification]
  )
  const timeLabel = useMemo(() => formatScheduledTime(notification?.scheduledTime), [notification])
  const resolvedMissedMedications = useMemo(() => {
    if (!notification) return []
    const merged = new Map()
    const push = (item = {}) => {
      const key = item.medicationId || item.medicationName || JSON.stringify(item)
      if (!key || merged.has(key)) return
      merged.set(key, item)
    }
    ; (notification.missedMedications || []).forEach(push)
    ; (fetchedMeds || []).forEach(push)
    return Array.from(merged.values())
  }, [notification, fetchedMeds])

  const summary = useMemo(
    () => buildMissedSummary(resolvedMissedMedications, notification?.missedCount),
    [resolvedMissedMedications, notification?.missedCount]
  )

  const getTypeBadgeText = (type) => {
    switch (type) {
      case 'medication.logged':
        return '복용 알림'
      case 'medication.missed':
      case 'medication.missed.aggregated':
        return '미복용 알림'
      default:
        return '알림'
    }
  }

  useEffect(() => {
    if (!notification || !isMissed) return
    if (notification?.missedMedications && notification.missedMedications.length > 0) return
    const created = new Date(notification.createdAt)
    if (Number.isNaN(created.getTime())) return

    const pad = (num) => String(num).padStart(2, '0')
    const dateStr = `${created.getFullYear()}-${pad(created.getMonth() + 1)}-${pad(created.getDate())}`

    const targetTimeLabel = formatScheduledTime(notification.scheduledTime)

    setFetching(true)
    medicationLogApiClient
      .getByDate(dateStr)
      .then((logs = []) => {
        const missedLogs = logs.filter((log) => log.missed)
        const filtered = targetTimeLabel
          ? missedLogs.filter((log) => formatScheduledTime(log.scheduledTime) === targetTimeLabel)
          : missedLogs
        const meds = (filtered.length > 0 ? filtered : missedLogs).map((log) => ({
          medicationId: log.medicationId,
          medicationName: log.medicationName || '약',
          dosage: log.dosage,
        }))
        setFetchedMeds(meds)
      })
      .catch((error) => {
        console.warn('Failed to fetch missed medications for detail', error)
      })
      .finally(() => setFetching(false))
  }, [isMissed, notification])

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

          <p className={styles.bodyText}>{notification.message}</p>

          {isMissed && (
            <div className={styles.metaSection}>
              {timeLabel && <div className={styles.metaPill}>예정 시간 {timeLabel}</div>}
              {summary && <div className={styles.metaPill}>{summary}</div>}
            </div>
          )}

          {isMissed && (
            <div className={styles.listSection}>
              <h3 className={styles.sectionTitle}>미복용 약 목록</h3>
              {fetching && <div className={styles.subtleText}>목록을 불러오는 중...</div>}
              {resolvedMissedMedications.length > 0 ? (
                <ul className={styles.medList}>
                  {resolvedMissedMedications.map((med, idx) => (
                    <li key={`${med.medicationId || med.medicationName || idx}`} className={styles.medItem}>
                      <div className={styles.medName}>{med.medicationName || '약'}</div>
                      {med.dosage && <div className={styles.medDosage}>{med.dosage}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.subtleText}>표시할 미복용 약 정보가 없습니다.</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  )
}

export default NotificationDetailPage

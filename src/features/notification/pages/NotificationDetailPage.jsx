/**
 * 알림 상세 페이지
 * @page 34-notification-detail
 * @component NotificationDetailPage
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'

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
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BackButton />
              <Typography variant="h5" fontWeight={800}>
                알림 상세
              </Typography>
            </Stack>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">알림을 찾을 수 없습니다.</Typography>
            </Paper>
          </Stack>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BackButton />
            <Typography variant="h5" fontWeight={800}>
              알림 상세
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Chip label={getTypeBadgeText(notification.type)} color="primary" size="small" />
                {formattedDate && (
                  <Typography variant="caption" color="text.secondary">
                    {formattedDate}
                  </Typography>
                )}
              </Stack>

              <Typography variant="h6" fontWeight={800}>
                {notification.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>

              {isMissed && (
                <Box>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {timeLabel && <Chip size="small" label={`예정 시간 ${timeLabel}`} />}
                    {summary && <Chip size="small" label={summary} />}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                      미복용 약 목록
                    </Typography>
                    {fetching && (
                      <Typography variant="body2" color="text.secondary">
                        목록을 불러오는 중...
                      </Typography>
                    )}
                    {resolvedMissedMedications.length > 0 ? (
                      <Stack spacing={1}>
                        {resolvedMissedMedications.map((med, idx) => (
                          <Paper
                            key={`${med.medicationId || med.medicationName || idx}`}
                            variant="outlined"
                            sx={{ p: 1.5, borderRadius: 2 }}
                          >
                            <Typography fontWeight={700}>
                              {med.medicationName || '약'}
                            </Typography>
                            {med.dosage && (
                              <Typography variant="body2" color="text.secondary">
                                {med.dosage}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        표시할 미복용 약 정보가 없습니다.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default NotificationDetailPage

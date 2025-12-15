/**
 * 알림 목록 페이지
 * @page 33-notifications
 * @component NotificationPage
 */

import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Container,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'

const mergeMedications = (a = [], b = []) => {
  const byId = new Map()
  a.forEach((item) => {
    const key = item?.medicationId || item?.medicationName || JSON.stringify(item)
    if (!byId.has(key)) byId.set(key, item)
  })
  b.forEach((item) => {
    const key = item?.medicationId || item?.medicationName || JSON.stringify(item)
    if (!byId.has(key)) byId.set(key, item)
  })
  return Array.from(byId.values()).filter(Boolean)
}

const formatScheduledTime = (value) => {
  if (!value) return null
  if (typeof value === 'string' && value.length <= 8 && value.includes(':')) {
    return value.slice(0, 5)
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const buildMissedSummary = (notification) => {
  if (!notification) return null
  const meds = notification.missedMedications
  if (Array.isArray(meds) && meds.length > 0) {
    const first = meds[0]?.medicationName || '약'
    return meds.length > 1 ? `${first} 외 ${meds.length - 1}개` : first
  }
  if (notification.missedCount) {
    return `약 ${notification.missedCount}건`
  }
  return null
}

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

  const displayNotifications = useMemo(() => {
    const grouped = new Map()
    notifications.forEach((n) => {
      const typeKey = (n.type || '').toLowerCase()
      const key = n.groupKey || (typeKey.includes('missed') && n.scheduledTime ? `${typeKey}-${n.scheduledTime}` : n.id)
      const existing = grouped.get(key)
      if (existing) {
        grouped.set(key, {
          ...existing,
          read: existing.read && n.read,
          createdAt:
            new Date(existing.createdAt || 0) > new Date(n.createdAt || 0)
              ? existing.createdAt
              : n.createdAt,
          missedMedications: mergeMedications(existing.missedMedications, n.missedMedications),
          missedCount: Math.max(
            existing.missedCount || 0,
            n.missedCount || 0,
            Array.isArray(existing.missedMedications) ? existing.missedMedications.length : 0,
            Array.isArray(n.missedMedications) ? n.missedMedications.length : 0
          ),
          message: existing.message || n.message,
        })
      } else {
        grouped.set(
          key,
          n.scheduledTime
            ? {
                ...n,
                groupKey: key,
              }
            : n
        )
      }
    })

    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
  }, [notifications])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    navigate(ROUTE_PATHS.notificationDetail.replace(':id', notification.id), {
      state: { notification }
    })
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

  const renderMessage = (notification) => {
    const isMissed = (notification.type || '').toLowerCase().includes('missed')
    const timeLabel = formatScheduledTime(notification.scheduledTime)
    const summary = buildMissedSummary(notification)
    if (isMissed && timeLabel && summary) {
      return `${timeLabel} 예정 ${summary} 복용을 아직 하지 않았습니다.`
    }
    return notification.message
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BackButton />
            <Typography variant="h5" fontWeight={800}>
              알림
            </Typography>
            <Box sx={{ flex: 1 }} />
            {unreadCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                읽지 않음 {unreadCount}개
              </Typography>
            )}
          </Stack>

          {unreadCount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Chip
                label="모두 읽음 표시"
                color="primary"
                variant="outlined"
                onClick={handleMarkAllAsRead}
              />
            </Box>
          )}

          {loading && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">알림을 불러오는 중...</Typography>
            </Paper>
          )}

          {!loading && displayNotifications.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 28 }} aria-hidden="true">
                🔔
              </Typography>
              <Typography fontWeight={700} sx={{ mt: 1 }}>
                새로운 알림이 없습니다
              </Typography>
            </Paper>
          )}

          {!loading && displayNotifications.length > 0 && (
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <List disablePadding>
                {displayNotifications.map((notification) => {
                  const isMissed = (notification.type || '').toLowerCase().includes('missed')
                  const summary = buildMissedSummary(notification)
                  const timeLabel = formatScheduledTime(notification.scheduledTime)

                  return (
                    <ListItemButton
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        alignItems: 'flex-start',
                        gap: 2,
                        borderLeft: 4,
                        borderLeftColor: notification.read ? 'transparent' : 'primary.main',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography fontWeight={800}>{notification.title}</Typography>
                            {!notification.read && (
                              <Chip size="small" label="새 알림" color="primary" />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={1} sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.primary">
                              {renderMessage(notification)}
                            </Typography>
                            {isMissed && (summary || timeLabel) && (
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {timeLabel && <Chip size="small" label={timeLabel} />}
                                {summary && <Chip size="small" label={summary} />}
                              </Stack>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.createdAt)}
                            </Typography>
                          </Stack>
                        }
                      />

                      <IconButton
                        edge="end"
                        aria-label="삭제"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                  )
                })}
              </List>
            </Paper>
          )}
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default NotificationPage

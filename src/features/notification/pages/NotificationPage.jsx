/**
 * 알림 목록 페이지
 * @page 33-notifications
 * @component NotificationPage
 */

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuth } from '@features/auth/hooks/useAuth'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { USER_ROLES } from '@config/constants'
import { useFamilyStore } from '@features/family/store/familyStore'

const normalizeTypeKey = (value) => String(value || '').toLowerCase().replace(/\./g, '_')

const isDietWarningType = (notification) => normalizeTypeKey(notification?.type) === 'diet_warning'

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
  const { 
    notifications, 
    loading, 
    unreadCount, 
    hasMore,
    fetchNotifications, 
    loadMoreNotifications,
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    removeAllNotifications 
  } = useNotificationStore()
  const customerRole = useAuth((state) => state.customerRole)
  const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER
  const familyMembers = useFamilyStore((state) => state.members || [])
  const [importantExpanded, setImportantExpanded] = useState(true)
  const [normalExpanded, setNormalExpanded] = useState(false)

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null)

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMoreNotifications()
    }
  }, [loading, hasMore, loadMoreNotifications])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [handleLoadMore])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const displayNotifications = useMemo(() => {
    const grouped = new Map()
    notifications.forEach((n) => {
      const typeKey = normalizeTypeKey(n.type)
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
    const typeKey = normalizeTypeKey(notification?.type)
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (typeKey.includes('missed')) {
      if (isCaregiver) {
        const senior = (familyMembers || []).find((m) => m.role === 'SENIOR') || null
        if (senior?.id) {
          navigate(ROUTE_PATHS.familyMemberMedication.replace(':id', String(senior.id)))
          return
        }
        navigate(ROUTE_PATHS.family)
        return
      }

      navigate(ROUTE_PATHS.medicationToday)
      return
    }

    navigate(ROUTE_PATHS.notificationDetail.replace(':id', notification.id), {
      state: { notification },
    })
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const resolveDietWarningPath = () => {
    if (!isCaregiver) return ROUTE_PATHS.dietWarning
    const senior = (familyMembers || []).find((m) => m.role === 'SENIOR') || null
    if (!senior?.userId) return ROUTE_PATHS.dietWarning
    return `${ROUTE_PATHS.dietWarning}?userId=${encodeURIComponent(String(senior.userId))}`
  }

  const handleDeleteAll = async () => {
    if (displayNotifications.length === 0) return
    if (!window.confirm('모든 알림을 삭제하시겠습니까?')) return
    await removeAllNotifications()
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

  const getImportantRank = (notification) => {
    const typeKey = normalizeTypeKey(notification?.type)
    if (typeKey.includes('missed')) return 0
    if (isDietWarningType(notification)) return 1
    return 2
  }

  const formatDayKey = (date) => {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return 'unknown'
    const year = d.getFullYear()
    const month = `${d.getMonth() + 1}`.padStart(2, '0')
    const day = `${d.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDayLabel = (dayKey) => {
    if (!dayKey || dayKey === 'unknown') return '기타'
    const [y, m, d] = dayKey.split('-').map((v) => Number.parseInt(v, 10))
    const asDate = new Date(y, (m || 1) - 1, d || 1)
    if (Number.isNaN(asDate.getTime())) return '기타'

    const todayKey = formatDayKey(new Date())
    if (dayKey === todayKey) return '오늘'

    return asDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const formatTimeLabel = (notification) => {
    const scheduled = formatScheduledTime(notification?.scheduledTime)
    if (scheduled) return scheduled
    const createdAt = new Date(notification?.createdAt || 0)
    if (Number.isNaN(createdAt.getTime())) return ''
    return createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const groupByDayAndTime = (items, { importantSort = false } = {}) => {
    const sorted = [...items].sort((a, b) => {
      if (importantSort) {
        const rank = getImportantRank(a) - getImportantRank(b)
        if (rank !== 0) return rank
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    const byDay = new Map()
    for (const notification of sorted) {
      const dayKey = formatDayKey(notification.createdAt)
      const list = byDay.get(dayKey) || []
      list.push(notification)
      byDay.set(dayKey, list)
    }

    const dayGroups = Array.from(byDay.entries())
      .map(([dayKey, dayItems]) => {
        const byTime = new Map()
        for (const notification of dayItems) {
          const timeLabel = formatTimeLabel(notification) || '기타'
          const groupItems = byTime.get(timeLabel) || []
          groupItems.push(notification)
          byTime.set(timeLabel, groupItems)
        }

        const timeGroups = Array.from(byTime.entries())
          .map(([timeLabel, groupItems]) => ({
            timeLabel,
            items: groupItems,
          }))
          .sort((a, b) => {
            if (importantSort) {
              const minRank = (group) => Math.min(...group.items.map(getImportantRank))
              const rankDiff = minRank(a) - minRank(b)
              if (rankDiff !== 0) return rankDiff
            }
            const aa = a.timeLabel
            const bb = b.timeLabel
            const toMinutes = (label) => {
              const match = String(label).match(/(\d{1,2}):(\d{2})/)
              if (!match) return -1
              return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10)
            }
            return toMinutes(bb) - toMinutes(aa)
          })

        return {
          dayKey,
          dayLabel: getDayLabel(dayKey),
          items: dayItems,
          timeGroups,
        }
      })
      .sort((a, b) => b.dayKey.localeCompare(a.dayKey))

    return dayGroups
  }

  const missedNotifications = useMemo(
    () => displayNotifications.filter((n) => normalizeTypeKey(n.type).includes('missed')),
    [displayNotifications],
  )

  const dietWarningNotifications = useMemo(
    () => displayNotifications.filter((n) => isDietWarningType(n)),
    [displayNotifications],
  )

  const importantNotifications = useMemo(() => {
    const isImportant = (notification) => {
      const typeKey = normalizeTypeKey(notification?.type)
      return typeKey.includes('missed') || typeKey === 'diet_warning'
    }
    return displayNotifications.filter(isImportant)
  }, [displayNotifications])

  const normalNotifications = useMemo(() => {
    const isImportant = (notification) => {
      const typeKey = normalizeTypeKey(notification?.type)
      return typeKey.includes('missed') || typeKey === 'diet_warning'
    }
    return displayNotifications.filter((n) => !isImportant(n))
  }, [displayNotifications])

  const hasHighlights = importantNotifications.length > 0 || isCaregiver
  const missedTimeLabels = missedNotifications
    .map((n) => formatScheduledTime(n.scheduledTime))
    .filter(Boolean)
    .slice(0, 3)
  const missedSummary = missedTimeLabels.length ? missedTimeLabels.join(', ') : null
  const missedUnreadCount = missedNotifications.filter((n) => !n.read).length

  const renderNotificationItem = (notification) => {
    const isMissed = (notification.type || '').toLowerCase().includes('missed')
    const isDietWarning = isDietWarningType(notification)
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
              {!notification.read && <Chip size="small" label="새 알림" color="primary" />}
              {isDietWarning ? <Chip size="small" color="warning" label="식단 경고" /> : null}
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
          secondaryTypographyProps={{ component: 'div' }}
        />

        <IconButton
          edge="end"
          aria-label="삭제"
          onClick={(e) => handleDelete(e, notification.id)}
          sx={{ mt: -0.5 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    )
  }

  const renderListSection = ({ title, items, emptyText, defaultExpanded, onToggle }) => {
    const dayGroups = groupByDayAndTime(items, { importantSort: title.includes('중요') })
    const todayKey = formatDayKey(new Date())
    const hasToday = dayGroups.some((group) => group.dayKey === todayKey)

    return (
      <Accordion
        disableGutters
        elevation={0}
        expanded={defaultExpanded}
        onChange={(_, expanded) => onToggle?.(expanded)}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'common.white',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'text.secondary' }}>{title}</Typography>
            <Chip size="small" label={`${items.length}개`} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {items.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, bgcolor: 'common.white' }}>
              <Typography variant="body2" color="text.secondary">
                {emptyText}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {dayGroups.map((dayGroup, index) => (
                <Accordion
                  key={dayGroup.dayKey}
                  defaultExpanded={hasToday ? dayGroup.dayKey === todayKey : index === 0}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                      <Typography sx={{ fontWeight: 900 }}>{dayGroup.dayLabel}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayGroup.items.length}개
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List disablePadding>
                      {dayGroup.timeGroups.map((timeGroup) => (
                        <Box key={`${dayGroup.dayKey}-${timeGroup.timeLabel}`}>
                          <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                              {timeGroup.timeLabel}
                            </Typography>
                          </Box>
                          {timeGroup.items.map(renderNotificationItem)}
                        </Box>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    )
  }

  const renderListArea = () => {
    if (loading) {
      return (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography color="text.secondary">알림을 불러오는 중...</Typography>
        </Paper>
      )
    }

    if (displayNotifications.length === 0) {
      return (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 28 }} aria-hidden="true">
            🔔
          </Typography>
          <Typography fontWeight={700} sx={{ mt: 1 }}>
            새로운 알림이 없습니다
          </Typography>
        </Paper>
      )
    }

    return (
      <Paper
        variant="outlined"
        sx={{
          bgcolor: { xs: '#F8FAFC', md: 'common.white' },
          border: { xs: 'none', md: '1px solid' },
          borderColor: 'divider',
          p: { xs: 1.5, md: 3 },
          borderRadius: 3,
          maxHeight: { md: 620 },
          overflowY: { md: 'auto' },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'text.secondary' }}>알림</Typography>
          <Box />
        </Stack>

        <Stack spacing={2.25}>
          {renderListSection({
            title: '중요 알림',
            items: importantNotifications,
            emptyText: '중요 알림이 없습니다.',
            defaultExpanded: importantExpanded,
            onToggle: setImportantExpanded,
          })}
          {renderListSection({
            title: '일반 알림',
            items: normalNotifications,
            emptyText: '일반 알림이 없습니다.',
            defaultExpanded: normalExpanded,
            onToggle: setNormalExpanded,
          })}

          {/* Infinite scroll trigger */}
          <Box ref={loadMoreRef} sx={{ py: 2, textAlign: 'center' }}>
            {loading && <CircularProgress size={24} />}
            {!loading && !hasMore && displayNotifications.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                더 이상 알림이 없습니다
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    )
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="알림"
          subtitle={unreadCount > 0 ? `읽지 않음 ${unreadCount}개` : null}
          right={
            <Stack direction="row" spacing={1} alignItems="center">
              {unreadCount > 0 ? (
                <Chip label="모두 읽음" color="primary" variant="outlined" onClick={handleMarkAllAsRead} />
              ) : null}
              <IconButton aria-label="모두 삭제" onClick={handleDeleteAll} disabled={displayNotifications.length === 0}>
                <DeleteSweepIcon />
              </IconButton>
            </Stack>
          }
        />

        {hasHighlights ? (
          <Box
            sx={{
              display: { xs: 'flex', md: 'grid' },
              flexDirection: { xs: 'column', md: 'unset' },
              gridTemplateColumns: { md: '4fr 8fr' },
              gap: 2.5,
            }}
          >
            <Stack spacing={2}>
              {missedNotifications.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    bgcolor: '#FEF2F2',
                    borderColor: '#FECACA',
                    borderRadius: 3,
                    p: 2.5,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Typography sx={{ fontWeight: 900, color: '#991B1B' }}>
                      {isCaregiver ? '복약 미준수 감지' : '복용 알림 (긴급)'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#B91C1C', lineHeight: 1.6 }}>
                      {missedSummary ? (
                        <>
                          <Box component="span" sx={{ fontWeight: 900 }}>
                            {missedSummary}
                          </Box>{' '}
                          예정 약을 아직 복용하지 않았습니다.
                        </>
                      ) : (
                        '아직 복용하지 않은 약이 있습니다.'
                      )}
                      <br />
                      {isCaregiver ? '연락하여 확인이 필요합니다.' : '지금 바로 복용해주세요!'}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: 'wrap' }}>
                      {isCaregiver ? (
                        <Button
                          variant="contained"
                          onClick={() => navigate(ROUTE_PATHS.familyChat)}
                          sx={{ bgcolor: '#6366F1', fontWeight: 900, '&:hover': { bgcolor: '#4F46E5' } }}
                        >
                          가족 채팅
                        </Button>
                      ) : null}
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (isCaregiver) {
                            const senior = (familyMembers || []).find((m) => m.role === 'SENIOR') || null
                            if (senior?.id) {
                              navigate(ROUTE_PATHS.familyMemberMedication.replace(':id', String(senior.id)))
                              return
                            }
                            navigate(ROUTE_PATHS.family)
                            return
                          }
                          navigate(ROUTE_PATHS.medicationToday)
                        }}
                        sx={{ bgcolor: '#EF4444', fontWeight: 900, '&:hover': { bgcolor: '#DC2626' } }}
                      >
                        {isCaregiver ? '오늘 복약 보기' : '복용하러 가기'}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ) : null}

              {dietWarningNotifications.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    bgcolor: '#FFFBEB',
                    borderColor: '#FDE68A',
                    borderRadius: 3,
                    p: 2.5,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Typography sx={{ fontWeight: 900, color: '#92400E' }}>식이 경고</Typography>
                    <Typography variant="body2" sx={{ color: '#B45309', lineHeight: 1.6 }}>
                      {dietWarningNotifications.length > 1
                        ? `식단 경고 알림이 ${dietWarningNotifications.length}개 있습니다.`
                        : (dietWarningNotifications[0]?.message || '식단 경고 알림이 있습니다.')}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate(resolveDietWarningPath())}
                        sx={{ fontWeight: 900 }}
                      >
                        식이 경고 보기
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ) : null}

              {isCaregiver ? (
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
                  <Stack spacing={1.25}>
                    <Typography sx={{ fontWeight: 900 }}>케어 현황 요약</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip size="small" label={`읽지 않음 ${unreadCount}개`} />
                      {missedUnreadCount > 0 ? (
                        <Chip size="small" color="error" label={`미준수 ${missedUnreadCount}개`} />
                      ) : null}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      중요한 알림부터 확인하고, 필요하면 가족 채팅으로 바로 연락하세요.
                    </Typography>
                  </Stack>
                </Paper>
              ) : null}
            </Stack>

            {renderListArea()}
          </Box>
        ) : (
          renderListArea()
        )}
      </PageStack>
    </MainLayout>
  )
}

export default NotificationPage

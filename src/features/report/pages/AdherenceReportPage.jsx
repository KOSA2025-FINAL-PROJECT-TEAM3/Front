import logger from '@core/utils/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const RECENT_DAYS = 14
const LOG_STATUS_CONFIG = {
  completed: { label: '복용완료', color: 'success' },
  missed: { label: '미복용', color: 'error' },
  pending: { label: '예정', color: 'warning' },
}

const normalizeStatus = (status) => {
  if (typeof status !== 'string') return status
  const normalized = status.trim().toLowerCase()
  if (!normalized) return null
  if (normalized === 'complete') return 'completed'
  if (normalized === 'miss') return 'missed'
  if (normalized === 'scheduled') return 'pending'
  return normalized
}

const resolveLogStatus = (log) => {
  const normalized = normalizeStatus(log?.status)
  if (normalized && LOG_STATUS_CONFIG[normalized]) return normalized
  if (log?.completed) return 'completed'
  if (log?.missed) return 'missed'
  return 'pending'
}

const formatDateKey = (dateInput) => {
  if (!dateInput) return null

  const raw = String(dateInput)
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) {
    return match[1]
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateKey) => {
  const normalizedKey = formatDateKey(dateKey)
  if (!normalizedKey) return ''
  const date = new Date(`${normalizedKey}T00:00:00`)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

const formatDisplayTime = (dateInput) => {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [adherenceData, setAdherenceData] = useState(null)
  const [recentHistory, setRecentHistory] = useState([])
  const [dailyLogs, setDailyLogs] = useState([])
  const [dailyLogsError, setDailyLogsError] = useState(null)
  const [expandedDate, setExpandedDate] = useState(null)
  const [dateRangeKeys, setDateRangeKeys] = useState({ start: null, end: null })
  const { consumeAction } = useVoiceActionStore()

  const handleDownloadPdf = useCallback(async () => {
    try {
      toast.info('리포트를 생성하고 있습니다...')
      const blob = await medicationLogApiClient.getAdherenceSummaryPdf()
      
      // Blob 다운로드 처리
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `adherence_report_${new Date().toISOString().slice(0, 10)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('리포트가 다운로드되었습니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패:', error)
      toast.error('리포트 생성에 실패했습니다')
    }
  }, [])

  // 음성 명령 처리 (PDF 다운로드)
  useEffect(() => {
    const action = consumeAction('DOWNLOAD_PDF')
    if (action) {
      handleDownloadPdf()
    }
  }, [consumeAction, handleDownloadPdf])

  useEffect(() => {
    const fetchAdherenceData = async () => {
      try {
        setLoading(true)
        setDailyLogsError(null)

        // 복약 순응도 요약 (7/30/365일)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - (RECENT_DAYS - 1))
        const startDateString = formatDateKey(startDate)
        const endDateString = formatDateKey(endDate)
        setDateRangeKeys({ start: startDateString, end: endDateString })

        const summaryPromise = medicationLogApiClient.getAdherenceSummary()
        const dailyPromise = medicationLogApiClient.getDailyAdherence(startDateString, endDateString)
        const dailyLogsPromise = medicationLogApiClient.getByDateRange(startDateString, endDateString)

        const [summary, dailyData] = await Promise.all([summaryPromise, dailyPromise])
        let logsResponse = []

        try {
          logsResponse = await dailyLogsPromise
        } catch (logError) {
          logger.error('일별 복약 기록 로딩 실패:', logError)
          setDailyLogsError('일별 복약 기록을 불러오는데 실패했습니다')
        }

        setAdherenceData(summary)
        setRecentHistory(dailyData || [])
        setDailyLogs(Array.isArray(logsResponse) ? logsResponse : [])
      } catch (error) {
        logger.error('순응도 데이터 로딩 실패:', error)
        toast.error('순응도 데이터를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchAdherenceData()
  }, [])

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'partial':
        return '일부'
      case 'missed':
        return '누락'
      default:
        return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'partial':
        return 'warning'
      case 'missed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getLogStatusLabel = (status) => LOG_STATUS_CONFIG[status]?.label || '미상'

  const getLogStatusColor = (status) => LOG_STATUS_CONFIG[status]?.color || 'default'

  const calculateStatus = (completed, total) => {
    if (total === 0) return 'missed'
    const rate = completed / total
    if (rate === 1) return 'completed'
    if (rate > 0) return 'partial'
    return 'missed'
  }

  const insights = useMemo(() => {
    if (!adherenceData) return []
    const lines = []
    const last30DaysRate = adherenceData.last30Days?.rate || 0
    const last7DaysRate = adherenceData.last7Days?.rate || 0
    const streakDays = adherenceData.streak || 0

    if (last30DaysRate >= 80) {
      lines.push('지난 한 달간 꾸준히 복용하고 있습니다.')
    } else if (last30DaysRate >= 50) {
      lines.push('복약 순응도를 높이기 위해 알림 설정을 활용해보세요.')
    } else {
      lines.push('복약 누락이 많습니다. 규칙적인 복용이 중요합니다.')
    }
    if (streakDays >= 7) {
      lines.push(`연속 ${streakDays}일 복용 중입니다.`)
    }
    if (last7DaysRate < last30DaysRate) {
      lines.push('이번 주 순응도가 낮습니다. 주말 복약에 특히 주의하세요.')
    }
    return lines
  }, [adherenceData])

  const dailyLogGroups = useMemo(() => {
    if (dailyLogs.length === 0) return []
    const grouped = new Map()

    dailyLogs.forEach((log) => {
      const dateKey = formatDateKey(log?.scheduledTime || log?.completedTime || log?.createdAt)
      if (!dateKey) return
      if (dateRangeKeys.start && dateKey < dateRangeKeys.start) return
      if (dateRangeKeys.end && dateKey > dateRangeKeys.end) return
      if (!grouped.has(dateKey)) grouped.set(dateKey, [])
      grouped.get(dateKey).push(log)
    })

    return Array.from(grouped.entries())
      .map(([date, logs]) => ({
        date,
        logs: logs.sort((a, b) => {
          const timeA = new Date(a?.scheduledTime || a?.completedTime || 0)
          const timeB = new Date(b?.scheduledTime || b?.completedTime || 0)
          return timeB - timeA
        }),
      }))
      .sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`))
  }, [dailyLogs, dateRangeKeys.end, dateRangeKeys.start])

  const handleAccordionChange = (dateKey) => (event, isExpanded) => {
    setExpandedDate(isExpanded ? dateKey : null)
  }

  if (loading) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader leading={<BackButton />} title="복약 순응도 리포트" subtitle="리포트를 불러오는 중..." />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">로딩 중...</Typography>
          </Paper>
        </PageStack>
      </MainLayout>
    )
  }

  if (!adherenceData) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader leading={<BackButton />} title="복약 순응도 리포트" subtitle="데이터를 불러올 수 없습니다." />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">데이터를 불러올 수 없습니다</Typography>
          </Paper>
        </PageStack>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="복약 순응도 리포트"
          right={
            <Button variant="outlined" onClick={handleDownloadPdf}>
              PDF 저장
            </Button>
          }
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              최근 30일 요약
            </Typography>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <Typography variant="h4" fontWeight={900}>
                {adherenceData.last30Days?.rate || 0}%
              </Typography>
              <Typography color="text.secondary">최근 30일 복약 순응도</Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  최근 7일
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.last7Days?.rate || 0}%
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  최근 365일
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.last365Days?.rate || 0}%
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  연속 복용
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.streak || 0}일
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            최근 복약 기록
          </Typography>

          {recentHistory.length === 0 ? (
            <Typography color="text.secondary">최근 복약 기록이 없습니다</Typography>
          ) : (
            <Stack spacing={1}>
              {recentHistory.map((day, index) => {
                const completed = day.completed || day.count
                const total = day.total || 0
                const status = calculateStatus(completed, total)
                const progress = total > 0 ? (completed / total) * 100 : 0

                return (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={800}>
                        {formatDisplayDate(day.date)}
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Chip size="small" color={getStatusColor(status)} label={getStatusLabel(status)} />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress variant="determinate" value={progress} color={getStatusColor(status)} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56, textAlign: 'right' }}>
                        {completed}/{total}
                      </Typography>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            일별 복약 상세
          </Typography>

          {dailyLogsError ? (
            <Typography color="text.secondary">{dailyLogsError}</Typography>
          ) : dailyLogGroups.length === 0 ? (
            <Typography color="text.secondary">최근 복약 상세 기록이 없습니다</Typography>
          ) : (
            <Stack spacing={1}>
              {dailyLogGroups.map((group) => {
                const counts = group.logs.reduce(
                  (acc, log) => {
                    const statusKey = resolveLogStatus(log)
                    if (statusKey === 'completed') acc.completed += 1
                    else if (statusKey === 'missed') acc.missed += 1
                    else if (statusKey === 'pending') acc.pending += 1
                    return acc
                  },
                  { completed: 0, missed: 0, pending: 0 }
                )

                return (
                  <Accordion
                    key={group.date}
                    expanded={expandedDate === group.date}
                    onChange={handleAccordionChange(group.date)}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography fontWeight={800}>{formatDisplayDate(group.date)}</Typography>
                        <Chip size="small" label={`완료 ${counts.completed}`} color="success" />
                        <Chip size="small" label={`예정 ${counts.pending}`} color="warning" />
                        <Chip size="small" label={`미복용 ${counts.missed}`} color="error" />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Stack spacing={1}>
                        {group.logs.map((log, index) => {
                          const statusKey = resolveLogStatus(log)
                          const displayTime = formatDisplayTime(
                            log?.scheduledTime || log?.completedTime || log?.createdAt
                          )

                          return (
                            <Paper
                              key={log?.id ?? `${log?.medicationScheduleId || 'log'}-${index}`}
                              variant="outlined"
                              sx={{ p: 1.5, borderRadius: 2 }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                                  {displayTime}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }} noWrap>
                                  {log?.medicationName || '알 수 없는 약'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={getLogStatusLabel(statusKey)}
                                  color={getLogStatusColor(statusKey)}
                                />
                              </Stack>
                            </Paper>
                          )
                        })}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            인사이트
          </Typography>
          {insights.length === 0 ? (
            <Typography color="text.secondary">표시할 인사이트가 없습니다.</Typography>
          ) : (
            <Stack spacing={0.75}>
              {insights.map((line) => (
                <Typography key={line} variant="body2" color="text.secondary">
                  - {line}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default AdherenceReportPage

import logger from '@core/utils/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [adherenceData, setAdherenceData] = useState(null)
  const [recentHistory, setRecentHistory] = useState([])
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

        // 복약 순응도 요약 (7/30/365일)
        const summary = await medicationLogApiClient.getAdherenceSummary()

        // 최근 14일 일별 순응도
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 14)

        const dailyData = await medicationLogApiClient.getDailyAdherence(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )

        setAdherenceData(summary)
        setRecentHistory(dailyData || [])
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
                        {new Date(day.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
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

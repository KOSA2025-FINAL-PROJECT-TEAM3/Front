import logger from '@core/utils/logger'
import { useState, useEffect } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { medicationApiClient } from '@/core/services/api/medicationApiClient'
import { normalizeServerLocalDate } from '@core/utils/formatting'
import { toast } from '@shared/components/toast/toastStore'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'

/**
 * 주간 통계 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const WeeklyStatsPage = () => {
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState([])
  const [medications, setMedications] = useState([])

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true)

        const today = new Date()
        const dates = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(today)
          date.setDate(today.getDate() - (6 - index))
          return date.toISOString().slice(0, 10)
        })

        const [logsByDay, meds] = await Promise.all([
          Promise.all(dates.map((date) => medicationLogApiClient.getByDate(date).catch(() => []))),
          medicationApiClient.list(),
        ])

        const dailyData = dates.map((date, index) => {
          const logs = logsByDay[index] || []
          const completed = logs.filter((log) => log?.completed).length
          const total = logs.length
          return { date, completed, total }
        })

        setWeeklyData(dailyData)
        setMedications(meds || [])
      } catch (error) {
        logger.error('주간 통계 로딩 실패:', error)
        toast.error('주간 통계를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyStats()
  }, [])

  const calculateWeeklyAverage = () => {
    if (weeklyData.length === 0) return 0
    const total = weeklyData.reduce((sum, day) => {
      const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0
      return sum + rate
    }, 0)
    return Math.round(total / weeklyData.length)
  }

  const getDayName = (value) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const normalized = normalizeServerLocalDate(value)
    if (!normalized) return ''
    const date = new Date(normalized)
    return days[date.getDay()]
  }

  if (loading) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader leading={<BackButton />} title="주간 통계" subtitle="주간 통계를 불러오는 중..." />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">로딩 중...</Typography>
          </Paper>
        </PageStack>
      </MainLayout>
    )
  }

  const weeklyAverage = calculateWeeklyAverage()

  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="주간 통계" />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="baseline">
            <Typography variant="h4" fontWeight={900}>
              {weeklyAverage}%
            </Typography>
            <Typography color="text.secondary">주간 평균 순응도</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            일별 복약 현황
          </Typography>
          {weeklyData.length === 0 ? (
            <Typography color="text.secondary">최근 7일간 데이터가 없습니다</Typography>
          ) : (
            <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 160 }}>
              {weeklyData.map((day, index) => {
                const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0
                const normalizedDate = normalizeServerLocalDate(day.date)
                const dateObj = normalizedDate ? new Date(normalizedDate) : null
                const color =
                  rate === 100
                    ? 'success.main'
                    : rate >= 50
                      ? 'warning.main'
                      : 'error.main'

                return (
                  <Box key={index} sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 28,
                          height: `${Math.max(4, rate)}%`,
                          bgcolor: color,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <Stack spacing={0.25} alignItems="center" sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight={700}>
                        {getDayName(day.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dateObj ? dateObj.getDate() : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(rate)}%
                      </Typography>
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            약물별 복약 현황
          </Typography>
          {medications.length === 0 ? (
            <Typography color="text.secondary">등록된 약물이 없습니다</Typography>
          ) : (
            <Stack spacing={1}>
              {medications.map((med) => (
                <Paper key={med.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="baseline">
                    <Typography fontWeight={800}>{med.name}</Typography>
                    {med.dosage && (
                      <Typography variant="body2" color="text.secondary">
                        {med.dosage}
                      </Typography>
                    )}
                    <Box sx={{ flex: 1 }} />
                    {med.timing && (
                      <Typography variant="caption" color="text.secondary">
                        {med.timing}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default WeeklyStatsPage

/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (실제 API 기반)
 * - MUI 스타일 적용 (React Native UI 구조)
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Typography, Stack, useMediaQuery, useTheme } from '@mui/material'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { ResponsiveContainer } from '@shared/components/layout/ResponsiveContainer'
import { MyMedicationSchedule } from '../components/MyMedicationSchedule'
import { QuickActionGrid } from '../components/QuickActionGrid'
import { SpeedDialFab } from '@shared/components/mui/SpeedDialFab'
import { HeroMedicationCard } from '../components/HeroMedicationCard'
import { WeeklyStatsWidget } from '../components/WeeklyStatsWidget'
import { TodayMedicationCheckbox } from '../components/TodayMedicationCheckbox'
import { LargeActionButtons } from '../components/LargeActionButtons'
import { SENIOR_QUICK_ACTIONS, SENIOR_FAB_ACTIONS } from '@/constants/uiConstants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { format, startOfWeek, endOfWeek, addDays, isAfter } from 'date-fns'
import { parseServerLocalDateTime } from '@core/utils/formatting'
import logger from '@core/utils/logger'

const getLogScheduleId = (log) =>
  log?.medicationScheduleId ??
  log?.scheduleId ??
  log?.medicationSchedule?.id ??
  log?.schedule?.id ??
  null

export const SeniorDashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth((state) => ({ user: state.user }))
  const { medications, fetchMedications } = useMedicationStore()
  const [exporting, setExporting] = useState(false)
  const [medicationLogs, setMedicationLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // 오늘 날짜
  const today = useMemo(() => new Date(), [])

  // 복약 로그 조회
  const loadMedicationLogs = useCallback(async () => {
    try {
      setLoading(true)
      const todayStr = today.toLocaleDateString('en-CA') // YYYY-MM-DD
      const response = await medicationLogApiClient.getByDate(todayStr)
      setMedicationLogs(response || [])
    } catch (error) {
      logger.error('Failed to load medication logs:', error)
      setMedicationLogs([])
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    fetchMedications()
    loadMedicationLogs()
  }, [fetchMedications, loadMedicationLogs])

  // 현재 시간대의 다음 복약 정보 (Hero Card용)
  const nextMedication = useMemo(() => {
    const pendingItems = medicationLogs
      .filter((log) => !log.completed && log.scheduledTime)
      .map((log) => {
        const medication = medications.find((m) => m.id === log.medicationId)
        const scheduledDate = parseServerLocalDateTime(log.scheduledTime)
        const scheduleTime = scheduledDate ? format(scheduledDate, 'HH:mm') : ''

        return {
          log,
          medication,
          scheduleTime,
          scheduledDate,
        }
      })
      .filter((item) => item.scheduledDate)
      .sort((a, b) => a.scheduledDate - b.scheduledDate)

    const next = pendingItems[0]

    if (!next) return null

    return {
      time: next.scheduleTime,
      medications: [
        {
          name: next.medication?.name || next.log.medicationName || '알 수 없는 약',
          dosage: next.medication?.dosage || '',
        },
      ],
      scheduleId: getLogScheduleId(next.log),
    }
  }, [medicationLogs, medications])

  // 오늘 일정을 시간대별로 변환
  const todaySchedules = useMemo(() => {
    const getTimeSection = (time) => {
      const hour = parseInt(time.split(':')[0])
      if (hour >= 5 && hour < 11) return 'morning'
      if (hour >= 11 && hour < 17) return 'lunch'
      if (hour >= 17 && hour < 21) return 'dinner'
      return 'night'
    }

    return medicationLogs.map((log, index) => {
      const medication = medications.find(m => m.id === log.medicationId)
      const scheduledDate = log.scheduledTime ? parseServerLocalDateTime(log.scheduledTime) : null
      const scheduleTime = scheduledDate ? format(scheduledDate, 'HH:mm') : ''

      return {
        id: log.id || index,
        log, // Add this line
        time: scheduleTime,
        medicationName: medication?.name || log.medicationName || '알 수 없는 약',
        dosage: medication?.dosage || '',
        status: log.completed ? 'completed' : 'pending',
        section: getTimeSection(scheduleTime),
      }
    })
  }, [medicationLogs, medications])

  const [weeklyStats, setWeeklyStats] = useState(Array(7).fill({ status: 'pending' }))

  // 주간 통계 조회 (로그 기반)
  const loadWeeklyStats = useCallback(async () => {
    try {
      // 이번 주 월요일 ~ 일요일 계산
      const start = startOfWeek(today, { weekStartsOn: 1 })
      const end = endOfWeek(today, { weekStartsOn: 1 })

      const startDateStr = format(start, 'yyyy-MM-dd')
      const endDateStr = format(end, 'yyyy-MM-dd')

      // 로그 기반으로 직접 조회
      const logs = await medicationLogApiClient.getByDateRange(startDateStr, endDateStr) || []

      // 로그를 날짜별로 그룹화하여 집계
      const stats = Array.from({ length: 7 }).map((_, index) => {
        const dayDate = addDays(start, index)
        const dateStr = format(dayDate, 'yyyy-MM-dd')

        // 미래 날짜는 'pending'
        if (isAfter(dayDate, new Date())) {
          return { status: 'pending' }
        }

        // 해당 날짜의 로그 필터링
        const dayLogs = logs.filter(log => {
          if (!log.scheduledTime) return false
          const logDate = parseServerLocalDateTime(log.scheduledTime)
          return logDate && format(logDate, 'yyyy-MM-dd') === dateStr
        })

        // 로그가 없으면 pending
        if (dayLogs.length === 0) {
          return { status: 'pending' }
        }

        // 완료된 로그 수 계산
        const completed = dayLogs.filter(log => log.completed).length
        const total = dayLogs.length

        if (completed >= total) {
          return { status: 'completed' }
        } else {
          return { status: 'missed' }
        }
      })

      setWeeklyStats(stats)
    } catch (error) {
      logger.error('Failed to load weekly stats:', error)
    }
  }, [today])

  useEffect(() => {
    loadWeeklyStats()
  }, [loadWeeklyStats])

  const adherenceRate = useMemo(() => {
    const completed = weeklyStats.filter(d => d.status === 'completed').length
    return Math.round((completed / weeklyStats.length) * 100)
  }, [weeklyStats])

  const handleExportPdf = async () => {
    const userId = user?.id || user?.userId
    if (!userId) {
      toast.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    setExporting(true)
    try {
      const blob = await diseaseApiClient.exportPdf(userId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diseases.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF 다운로드를 시작합니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  // 복약 완료 처리
  const handleConfirmMedication = async () => {
    if (!nextMedication?.scheduleId) return

    try {
      await medicationLogApiClient.completeMedication(nextMedication.scheduleId)
      toast.success('복약이 완료되었습니다.')

      // 로그 다시 불러오기
      await loadMedicationLogs()
      await loadWeeklyStats()
    } catch (error) {
      logger.error('Failed to complete medication:', error)
      toast.error('복약 완료 처리에 실패했습니다.')
    }
  }

  // 시간대별 일괄 복약 처리
  const handleToggleTimeSection = async (section, items) => {
    // 이미 완료된 항목은 제외, 스케줄 ID가 있는 항목만 처리
    const pendingItems = items.filter((item) => item.status === 'pending' && getLogScheduleId(item.log))

    if (pendingItems.length === 0) return

    if (!window.confirm(`${pendingItems.length}개의 약을 복용 완료 처리하시겠습니까?`)) {
      return
    }

    try {
      await Promise.all(
        pendingItems.map((item) => {
          const scheduleId = getLogScheduleId(item.log)
          return medicationLogApiClient.completeMedication(scheduleId)
        })
      )
      toast.success('복용 처리가 완료되었습니다.')
      await loadMedicationLogs()
      await loadWeeklyStats()
    } catch (error) {
      logger.error('Failed to complete medications:', error)
      toast.error('일괄 처리 중 오류가 발생했습니다.')
    }
  }

  const fabActions = SENIOR_FAB_ACTIONS.map((action) => {
    if (action.id === 'pdf_export') {
      return {
        ...action,
        label: exporting ? '다운로드 중...' : action.label,
        onClick: () => !exporting && handleExportPdf(),
      }
    }
    return action
  })

  const todayDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <MainLayout>
      <ResponsiveContainer maxWidth="lg">
        <Stack spacing={4} sx={{ pb: 12 }}>
          {/* 헤더 */}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              오늘의 복용
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {todayDate}
            </Typography>
          </Box>

          {/* Hero 복약 알림 카드 - 항상 표시 */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>로딩 중...</Typography>
            </Box>
          ) : nextMedication ? (
            <HeroMedicationCard
              title="복약 시간입니다 💊"
              subtitle="정확한 약품 정보를 확인하세요."
              time={nextMedication.time}
              medications={nextMedication.medications}
              onConfirm={handleConfirmMedication}
            />
          ) : (
            <HeroMedicationCard
              title="오늘 복약 일정이 없습니다"
              subtitle="약 관리 페이지에서 약을 등록해주세요."
              medications={[]}
            />
          )}

          {/* 오늘 복약 체크박스 (큼직하게) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            <TodayMedicationCheckbox
              schedules={todaySchedules}
              onToggle={handleToggleTimeSection}
            />

            {/* 주간 복약 현황 */}
            <WeeklyStatsWidget
              title="지난 7일 기록"
              weeklyData={weeklyStats}
              adherenceRate={adherenceRate}
            />
          </Box>

          {/* 큰 버튼 2개 (약품 검색, 식단 로그) */}
          <LargeActionButtons />

          {/* 약 리스트 */}
          <Box>
            <MyMedicationSchedule title="전체 일정" showEmptyState={true} />
          </Box>

          {/* 빠른 작업 (맨 아래) - 나머지 작업들 */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              기타 작업
            </Typography>
            <QuickActionGrid actions={SENIOR_QUICK_ACTIONS} />
          </Box>
        </Stack>

        {isMobile && <SpeedDialFab actions={fabActions} />}
      </ResponsiveContainer>
    </MainLayout>
  )
}

export default SeniorDashboard

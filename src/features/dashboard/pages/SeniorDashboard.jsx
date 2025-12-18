/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (실제 API 기반)
 * - MUI 스타일 적용 (React Native UI 구조)
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { useNavigate } from 'react-router-dom'
import { QuickActionGrid } from '../components/QuickActionGrid'
import { HeroMedicationCard } from '../components/HeroMedicationCard'
import { WeeklyStatsWidget } from '../components/WeeklyStatsWidget'
import { TodayMedicationCheckbox } from '../components/TodayMedicationCheckbox'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuth } from '@features/auth/hooks/useAuth'
import { toast } from '@shared/components/toast/toastStore'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { format, startOfWeek, endOfWeek, addDays, isAfter, subDays } from 'date-fns'
import { parseServerLocalDateTime } from '@core/utils/formatting'
import logger from '@core/utils/logger'
import TodaySummaryCard from '../components/TodaySummaryCard'
import HistoryTimelineCard from '../components/HistoryTimelineCard'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'

const getLogScheduleId = (log) =>
  log?.medicationScheduleId ??
  log?.scheduleId ??
  log?.medicationSchedule?.id ??
  log?.schedule?.id ??
  null

export const SeniorDashboard = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth((state) => ({ user: state.user }))
  const { medications, fetchMedications } = useMedicationStore()
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)
  const [medicationLogs, setMedicationLogs] = useState([])
  const [historyData, setHistoryData] = useState([])
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

  const loadHistoryTimeline = useCallback(async () => {
    try {
      const end = subDays(today, 1)
      const start = subDays(today, 3)
      if (isAfter(start, end)) {
        setHistoryData([])
        return
      }

      const logs = await medicationLogApiClient.getByDateRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')) || []
      const byDate = new Map()

      const getTimeSectionLabel = (time) => {
        const hour = parseInt(String(time || '').split(':')[0] || '0', 10)
        if (hour >= 5 && hour < 11) return '아침'
        if (hour >= 11 && hour < 17) return '점심'
        if (hour >= 17 && hour < 21) return '저녁'
        return '야간'
      }

      logs.forEach((log) => {
        const scheduledDate = log?.scheduledTime ? parseServerLocalDateTime(log.scheduledTime) : null
        if (!scheduledDate) return

        const dateKey = format(scheduledDate, 'yyyy-MM-dd')
        const time = format(scheduledDate, 'HH:mm')
        const label = getTimeSectionLabel(time)
        const medication = medications.find((m) => m.id === log.medicationId)
        const medicationName = medication?.name || log.medicationName || '알 수 없는 약'

        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, { dateKey, date: scheduledDate, sections: new Map() })
        }

        const entry = byDate.get(dateKey)
        if (!entry.sections.has(label)) {
          entry.sections.set(label, { label, time, names: [], completed: true })
        }

        const section = entry.sections.get(label)
        section.names.push(medicationName)
        section.completed = section.completed && Boolean(log.completed)
        if (time && section.time && time < section.time) {
          section.time = time
        }
      })

      const groups = Array.from(byDate.values())
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .map((group) => {
          const items = Array.from(group.sections.values()).sort((a, b) => String(a.time).localeCompare(String(b.time)))
          return {
            key: group.dateKey,
            date: group.date,
            dateLabel: group.date?.toLocaleDateString?.('ko-KR', { month: 'long', day: 'numeric' }) || group.dateKey,
            dayLabel: group.date?.toLocaleDateString?.('ko-KR', { weekday: 'long' }) || '',
            items: items.map((item) => ({
              ...item,
              names: Array.from(new Set(item.names)).join(', '),
            })),
          }
        })

      setHistoryData(groups)
    } catch (error) {
      logger.error('Failed to load history timeline:', error)
      setHistoryData([])
    }
  }, [today, medications])

  useEffect(() => {
    loadWeeklyStats()
  }, [loadWeeklyStats])

  useEffect(() => {
    loadHistoryTimeline()
  }, [loadHistoryTimeline])

  const adherenceRate = useMemo(() => {
    const completed = weeklyStats.filter(d => d.status === 'completed').length
    return Math.round((completed / weeklyStats.length) * 100)
  }, [weeklyStats])

  void user

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

  const takenCount = useMemo(() => todaySchedules.filter((s) => s.status === 'completed').length, [todaySchedules])
  const totalCount = useMemo(() => todaySchedules.length, [todaySchedules])

  return (
    <MainLayout>
      <Box
        sx={{
          display: { xs: 'flex', md: 'grid' },
          flexDirection: { xs: 'column' },
          gridTemplateColumns: { md: '1fr 1fr' },
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* Column 1 */}
        <Stack spacing={{ xs: 3, md: 4 }}>
          {loading ? (
            <HeroMedicationCard title="불러오는 중..." subtitle="오늘 복약 일정을 확인하고 있어요." medications={[]} />
          ) : nextMedication ? (
            <HeroMedicationCard
              title="복약 시간입니다 💊"
              subtitle="정확한 약품 정보를 확인하세요."
              time={nextMedication.time}
              medications={nextMedication.medications}
              onConfirm={handleConfirmMedication}
              onOpenDetail={() => navigate(ROUTE_PATHS.medicationToday)}
            />
          ) : (
            <HeroMedicationCard title="오늘 복약 일정이 없습니다" subtitle="약을 등록하면 자동으로 일정이 생성돼요." medications={[]} />
          )}

          {/* Mobile: Summary sits under hero */}
          {isMobile ? (
            <TodaySummaryCard
              takenCount={takenCount}
              totalCount={totalCount}
              onClick={() => navigate(ROUTE_PATHS.medicationToday)}
            />
          ) : null}

          {/* RN-style quick actions */}
          <QuickActionGrid
            onSearchPill={() => openSearchOverlay('pill')}
            dietPath={ROUTE_PATHS.dietLog}
            chatPath={ROUTE_PATHS.familyChat}
          />
        </Stack>

        {/* Column 2 */}
        <Stack spacing={{ xs: 3, md: 4 }}>
          {!isMobile ? (
            <TodaySummaryCard
              takenCount={takenCount}
              totalCount={totalCount}
              onClick={() => navigate(ROUTE_PATHS.medicationToday)}
            />
          ) : null}

          <TodayMedicationCheckbox schedules={todaySchedules} onToggle={handleToggleTimeSection} />

          <WeeklyStatsWidget
            title="지난 7일 기록"
            weeklyData={weeklyStats}
            adherenceRate={adherenceRate}
            onClick={() => navigate(ROUTE_PATHS.weeklyStats)}
          />

          <HistoryTimelineCard historyData={historyData} onOpenDetail={() => navigate(ROUTE_PATHS.adherenceReport)} />
        </Stack>
      </Box>
    </MainLayout>
  )
}

export default SeniorDashboard

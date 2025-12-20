/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (실제 API 기반)
 * - MUI 스타일 적용 (React Native UI 구조)
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
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
import { shallow } from 'zustand/shallow'
import { format, startOfWeek, endOfWeek, addDays, isAfter } from 'date-fns'
import { parseServerLocalDateTime } from '@core/utils/formatting'
import logger from '@core/utils/logger'
import TodaySummaryCard from '../components/TodaySummaryCard'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'
import { useMedicationLogStore } from '@features/medication/store/medicationLogStore'
import { useAppointmentStore } from '@features/appointment/store/appointmentStore'
import { FoodWarningModal } from '@features/diet/components/FoodWarningModal'

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

  // shallow 비교로 불필요한 리렌더링 방지
  const { user } = useAuth((state) => ({ user: state.user }), shallow)
  const { medications, fetchMedications } = useMedicationStore(
    (state) => ({ medications: state.medications, fetchMedications: state.fetchMedications }),
    shallow
  )
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)
  const [loading, setLoading] = useState(true)
  const [dietWarningOpen, setDietWarningOpen] = useState(false)

  // Appointment Store
  const { appointments: appointmentList, fetchAppointments } = useAppointmentStore(
    (state) => ({ appointments: state.appointments, fetchAppointments: state.fetchAppointments }),
    shallow
  )

  useEffect(() => {
    if (user?.id) {
      // Fetch future appointments starting from today
      const today = new Date()
      const startDate = format(today, 'yyyy-MM-dd')
      fetchAppointments(user.id, { startDate })
    }
  }, [user?.id, fetchAppointments])

  const upcomingAppointment = useMemo(() => {
    if (!appointmentList || appointmentList.length === 0) return null
    const now = new Date()
    // Filter for future, non-cancelled/completed apps
    const future = appointmentList.filter((app) => {
      if (!app.visitAt) return false
      const appDate = new Date(app.visitAt)
      return appDate > now && app.status !== 'CANCELLED' && app.status !== 'COMPLETED'
    })
    // Sort by date/time ascending
    future.sort((a, b) => new Date(a.visitAt) - new Date(b.visitAt))
    return future[0]
  }, [appointmentList])

  const renderAppointmentCard = () => {
    // 날짜 포맷팅 함수
    const formatAppDate = (visitAt) => {
      if (!visitAt) return ''
      return new Date(visitAt).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }

    return (
      <Paper
        variant="outlined"
        onClick={() => navigate(ROUTE_PATHS.appointments)}
        sx={{
          p: 2,
          borderRadius: 3,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center content
          gap: 2,
          transition: 'all 0.2s ease',
          '&:hover': { boxShadow: 4, borderColor: 'primary.main', transform: 'translateY(-2px)' },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: upcomingAppointment ? '#EEF2FF' : '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          🏥
        </Box>
        <Box>
          {upcomingAppointment ? (
            <>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                {upcomingAppointment.hospitalName || '병원 정보 없음'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {formatAppDate(upcomingAppointment.visitAt)}
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0rem' }}>진료 일정</Typography>
              <Typography variant="body2" color="text.secondary">
                예정된 진료가 없습니다
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    )
  }

  // 오늘 날짜
  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => today.toLocaleDateString('en-CA'), [today])

  // Medication Log Store 사용
  const { logsByDate, fetchLogsByDate, updateLog } = useMedicationLogStore(
    (state) => ({
      logsByDate: state.logsByDate,
      fetchLogsByDate: state.fetchLogsByDate,
      updateLog: state.updateLog
    }),
    shallow
  )

  const medicationLogs = useMemo(() => logsByDate[todayStr] || [], [logsByDate, todayStr])

  // 복약 로그 조회 (캐싱 적용)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      await fetchLogsByDate(todayStr)
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [fetchLogsByDate, todayStr])

  useEffect(() => {
    fetchMedications()
    // logs 로딩은 위 useEffect에서 처리됨
  }, [fetchMedications])

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
        }

        // 오늘인 경우: 아직 시간이 안 된 약이 남아있다면 'pending' (진행중/예정) 처리
        if (dateStr === format(new Date(), 'yyyy-MM-dd')) {
          const now = new Date()
          const hasOverdue = dayLogs.some((log) => {
            if (log.completed) return false
            if (!log.scheduledTime) return false
            const logTime = parseServerLocalDateTime(log.scheduledTime)
            // 예정 시간이 지났는데 완료되지 않음 -> Missed
            return logTime && logTime < now
          })

          if (!hasOverdue) {
            return { status: 'pending' }
          }
        }

        return { status: 'missed' }
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



  // 복약 완료 처리
  const handleConfirmMedication = async () => {
    if (!nextMedication?.scheduleId) {
      logger.warn('[SeniorDashboard] scheduleId is missing, cannot complete medication', nextMedication)
      toast.error('해당 복용 일정을 찾을 수 없습니다. 약물 관리에서 스케줄을 확인해주세요.')
      return
    }

    // 복약 시간 체크 (30분 전부터 가능하도록 설정)
    if (nextMedication.time) {
      const now = new Date()
      const [hours, minutes] = nextMedication.time.split(':').map(Number)
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      // 만약 예정 시간이 현재 시간보다 30분 이상 미래라면 경고
      const timeDiff = scheduledTime.getTime() - now.getTime()
      const THIRTY_MINUTES = 30 * 60 * 1000

      if (timeDiff > THIRTY_MINUTES) {
        toast.warning(`아직 복용 시간이 아닙니다.\n(예정 시간: ${nextMedication.time})`)
        return
      }
    }

    try {
      await medicationLogApiClient.completeMedication(nextMedication.scheduleId)
      toast.success('복약이 완료되었습니다.')

      // 낙관적 업데이트 또는 다시 불러오기
      // 여기서는 다시 불러오기를 수행하되, Store를 통해 캐시 갱신
      await fetchLogsByDate(todayStr, true) // force refresh
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
      await fetchLogsByDate(todayStr, true)
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
            <HeroMedicationCard title="불러오는 중..." subtitle="오늘 복약 일정을 확인하고 있어요." medications={[]} sx={{ minHeight: 320 }} />
          ) : nextMedication ? (
            <HeroMedicationCard
              title="복약 시간입니다 💊"
              subtitle="정확한 약품 정보를 확인하세요."
              time={nextMedication.time}
              medications={nextMedication.medications}
              onConfirm={handleConfirmMedication}
              onOpenDetail={() => navigate(ROUTE_PATHS.medicationToday)}
              sx={{ minHeight: 320 }}
            />
          ) : (
            <HeroMedicationCard title="오늘 복약 일정이 없습니다" subtitle="약을 등록하면 자동으로 일정이 생성돼요." medications={[]} sx={{ minHeight: 320 }} />
          )}

          {/* Mobile: Summary sits under hero */}
          {isMobile ? (
            <>
              <TodaySummaryCard
                takenCount={takenCount}
                totalCount={totalCount}
                onClick={() => navigate(ROUTE_PATHS.medicationToday)}
              />
              {renderAppointmentCard()}
            </>
          ) : null}

          {/* RN-style quick actions */}
          <QuickActionGrid
            onSearchPill={() => openSearchOverlay('pill')}
            medicationPath={ROUTE_PATHS.medication}
            chatPath={ROUTE_PATHS.familyChat}
            onDietWarning={() => setDietWarningOpen(true)}
            onDiseaseSearch={() => openSearchOverlay('disease')}
          />

          {!isMobile ? (
            <TodaySummaryCard
              takenCount={takenCount}
              totalCount={totalCount}
              onClick={() => navigate(ROUTE_PATHS.medicationToday)}
            />
          ) : null}
        </Stack>

        {/* Column 2 */}
        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* TodayChecklist is here (visible on all devices) */}
          <TodayMedicationCheckbox
            schedules={todaySchedules}
            onToggle={handleToggleTimeSection}
            sx={{ minHeight: 320 }}
          />

          <WeeklyStatsWidget
            title="지난 7일 기록"
            weeklyData={weeklyStats}
            adherenceRate={adherenceRate}
            onClick={() => navigate(ROUTE_PATHS.weeklyStats)}
          />

          {/* Desktop/Tablet: Appointment Card settles here */}
          {!isMobile && renderAppointmentCard()}
        </Stack>
      </Box>
      <FoodWarningModal
        open={dietWarningOpen}
        onClose={() => setDietWarningOpen(false)}
        userId={user?.id}
      />
    </MainLayout>
  )
}

export default SeniorDashboard

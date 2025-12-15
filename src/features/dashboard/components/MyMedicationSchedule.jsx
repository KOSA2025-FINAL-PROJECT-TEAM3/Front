/**
 * MyMedicationSchedule Component
 * - 본인의 오늘 복용 일정을 표시하고 관리하는 공통 컴포넌트
 * - SeniorDashboard와 CaregiverDashboard에서 재사용
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { MedicationCard } from './MedicationCard'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { ROUTE_PATHS } from '@/core/config/routes.config'
import { format } from 'date-fns'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import { toast } from '@shared/components/toast/toastStore' // [Voice]
import logger from '@core/utils/logger'

// 시간대 라벨 결정
const getTimeLabel = (time) => {
  const hour = parseInt(time.split(':')[0])
  if (hour >= 5 && hour < 12) return '아침'
  if (hour >= 12 && hour < 17) return '점심'
  if (hour >= 17 && hour < 21) return '저녁'
  return '밤'
}

/**
 * 본인의 오늘 복용 일정 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 섹션 제목 (기본값: "내 복용 일정")
 * @param {boolean} props.showEmptyState - 빈 상태 표시 여부 (기본값: true)
 * @param {string} props.className - 추가 CSS 클래스
 */
export const MyMedicationSchedule = ({
  title = '내 복용 일정',
  showEmptyState = true,
  className = ''
}) => {
  const navigate = useNavigate()
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const { consumeAction } = useVoiceActionStore() // [Voice]
  const { medications, fetchMedications } = useMedicationStore()
  const [medicationLogs, setMedicationLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMedicationLogs = useCallback(async () => {
    try {
      setLoading(true)
      // 오늘 날짜의 로그만 조회
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
      const response = await medicationLogApiClient.getByDate(today)
      setMedicationLogs(response || [])
    } catch (error) {
      logger.error('Failed to load medication logs:', error)
      setMedicationLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedications()
    loadMedicationLogs()
  }, [fetchMedications, loadMedicationLogs])

  // 오늘 날짜 및 현재 시간
  const today = useMemo(() => {
    const now = new Date()
    return {
      currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      date: now,
      dateString: now.toLocaleDateString('en-CA'), // YYYY-MM-DD (Local Time)
    }
  }, [])

  // 로그 기반으로 오늘의 복용 스케줄 생성
  const todaySchedules = useMemo(() => {
    return medicationLogs.map((log, index) => {
      const scheduleId =
        log.medicationScheduleId ??
        log.scheduleId ??
        log.medicationSchedule?.id ??
        log.schedule?.id ??
        null
      const medication = medications.find((m) => m.id === log.medicationId)
      const scheduleTime = log.scheduledTime ? format(new Date(log.scheduledTime), 'HH:mm') : ''
      const isTaken = log.completed

      return {
        id: `${log.medicationId}-${scheduleId ?? `nosched-${log.id ?? index}`}`,
        medicationId: log.medicationId,
        scheduleId,
        isCompletable: Boolean(scheduleId),
        time: scheduleTime,
        timeLabel: getTimeLabel(scheduleTime),
        medications: [
          {
            name: medication?.name || log.medicationName || '알 수 없는 약',
            dose: medication?.dosage || '',
          },
        ],
        // 상태 결정: 복용 완료 > 현재 시간 기준
        status: isTaken ? 'completed' : scheduleTime <= today.currentTime ? 'pending' : 'scheduled',
        statusLabel: isTaken ? '복용 완료' : scheduleTime <= today.currentTime ? '복용하기' : '예정',
        isActive: !isTaken && scheduleTime <= today.currentTime,
      }
    }).sort((a, b) => a.time.localeCompare(b.time))
  }, [medicationLogs, medications, today.currentTime])

  const handleTakeMedication = useCallback(async (schedule) => {
    const scheduleIdRaw = schedule?.scheduleId ?? schedule?.medicationScheduleId
    const medicationIdRaw = schedule?.medicationId
    const scheduleId = scheduleIdRaw != null ? parseInt(scheduleIdRaw, 10) : null
    const medicationId = medicationIdRaw != null ? parseInt(medicationIdRaw, 10) : null

    if (!scheduleId || Number.isNaN(scheduleId) || !medicationId || Number.isNaN(medicationId)) {
      logger.error('Invalid schedule:', schedule)
      toast.error('유효하지 않은 스케줄입니다.')
      return
    }

    try {
      const completedTime = new Date().toISOString()
      setMedicationLogs((prev) => {
        let found = false
        const next = prev.map((log) => {
          const logScheduleId = log.medicationScheduleId ?? log.scheduleId
          if (logScheduleId != null && parseInt(logScheduleId, 10) === scheduleId) {
            found = true
            return { ...log, completed: true, completedTime }
          }
          return log
        })

        if (!found) {
          next.push({
            medicationId,
            medicationScheduleId: scheduleId,
            scheduledTime: schedule?.scheduledTime ?? completedTime,
            completed: true,
            completedTime,
          })
        }

        return next
      })

      await medicationLogApiClient.completeMedication(scheduleId)

      await loadMedicationLogs()

      logger.debug('복용 완료:', scheduleId)
    } catch (error) {
      logger.error('Failed to complete medication:', error)
      toast.error('복용 기록 저장에 실패했습니다.')
      await loadMedicationLogs()
    }
  }, [loadMedicationLogs])

  // [Voice] 음성 명령 처리 (자동 복용 체크)
  useEffect(() => {
    if (!loading && todaySchedules.length > 0 && pendingAction?.code === 'AUTO_COMPLETE') {
      const action = consumeAction('AUTO_COMPLETE')
      
      if (action) {
        const { params } = action
        const timeSlot = params?.timeSlot || 'NOW'
        const targetMedName = params?.medicationName

        const nowHour = new Date().getHours()

        const targetSchedules = todaySchedules.filter(schedule => {
          if (schedule.status === 'completed') return false

          // 1. 이름 매칭
          if (targetMedName) {
            const medName = schedule.medications[0]?.name?.replace(/\s+/g, '') || ''
            const query = targetMedName.replace(/\s+/g, '')
            if (!medName.includes(query)) return false
          }

          // 2. 시간대 매칭 (HH:mm 파싱)
          const hour = parseInt(schedule.time.split(':')[0])
          
          if (timeSlot === 'MORNING') return hour >= 5 && hour < 12
          if (timeSlot === 'LUNCH') return hour >= 12 && hour < 17
          if (timeSlot === 'DINNER') return hour >= 17 && hour < 21
          if (timeSlot === 'NOW') return Math.abs(hour - nowHour) <= 2
          
          return false
        })

        if (targetSchedules.length > 0) {
          targetSchedules.forEach((s) => handleTakeMedication(s))
          const countMsg = targetMedName ? `'${targetMedName}'` : `${targetSchedules.length}건`
          toast.success(`${timeSlot === 'NOW' ? '현재' : timeSlot} 시간대 ${countMsg}을(를) 복용 처리했습니다.`)
        } else {
          // 홈 화면에서는 토스트 메시지를 생략하거나 조용히 처리할 수도 있음
          // toast.info('해당하는 복용 일정이 없습니다.')
        }
      }
    }
  }, [loading, todaySchedules, consumeAction, pendingAction, handleTakeMedication])

  const handleCardClick = (medicationId) => {
    // 약 관리 페이지로 이동하면서 해당 약의 상세 모달 열기
    navigate(ROUTE_PATHS.medicationManagement, {
      state: { selectedMedicationId: medicationId },
    })
  }

  if (loading) {
    return (
      <Box className={className} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
          {title}
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            복용 일정을 불러오는 중...
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!showEmptyState && todaySchedules.length === 0) {
    return null
  }

  return (
    <Box className={className} sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
        {title}
      </Typography>

      <Stack spacing={1.5}>
        {todaySchedules.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              오늘 복용할 약이 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              약 관리 페이지에서 약을 등록하고 스케줄을 설정해주세요.
            </Typography>
          </Paper>
        ) : (
          todaySchedules.map((schedule) => (
            <MedicationCard
              key={schedule.id}
              schedule={schedule}
              onTakeMedication={handleTakeMedication}
              onCardClick={handleCardClick}
            />
          ))
        )}
      </Stack>
    </Box>
  )
}

export default MyMedicationSchedule

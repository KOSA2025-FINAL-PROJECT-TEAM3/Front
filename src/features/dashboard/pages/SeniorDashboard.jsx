/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (실제 API 기반)
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { MedicationCard } from '../components/MedicationCard'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { SENIOR_QUICK_ACTIONS, SENIOR_FAB_ACTIONS } from '@/data/mockUiConstants'
import { ROUTE_PATHS } from '@/core/config/routes.config'
import styles from './SeniorDashboard.module.scss'

// 요일 매핑 (JavaScript Date.getDay() → 백엔드 형식)
const DAY_MAP = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
}

// 시간대 라벨 결정
const getTimeLabel = (time) => {
  const hour = parseInt(time.split(':')[0])
  if (hour >= 5 && hour < 12) return '아침'
  if (hour >= 12 && hour < 17) return '점심'
  if (hour >= 17 && hour < 21) return '저녁'
  return '밤'
}

export const SeniorDashboard = () => {
  const navigate = useNavigate()
  const { medications, fetchMedications } = useMedicationStore()
  const [medicationLogs, setMedicationLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMedicationLogs = useCallback(async () => {
    try {
      const logs = await medicationLogApiClient.list()
      setMedicationLogs(logs || [])
    } catch (error) {
      console.error('Failed to load medication logs:', error)
      setMedicationLogs([])
    }
  }, [])

  useEffect(() => {
    fetchMedications()
    loadMedicationLogs()
  }, [fetchMedications, loadMedicationLogs])

  // 오늘 날짜 및 요일
  const today = useMemo(() => {
    const now = new Date()
    return {
      dayOfWeek: DAY_MAP[now.getDay()],
      currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      date: now,
      dateString: now.toLocaleDateString('en-CA'), // YYYY-MM-DD (Local Time)
    }
  }, [])

  // 오늘 복용한 스케줄 ID 목록
  const completedScheduleIds = useMemo(() => {
    const todayLogs = medicationLogs.filter((log) => {
      if (!log.completed) return false

      // scheduledTime 기준으로 오늘 날짜 확인 (Local Time)
      if (!log.scheduledTime) return false
      const logDate = new Date(log.scheduledTime).toLocaleDateString('en-CA')
      return logDate === today.dateString
    })

    console.log('Today logs:', todayLogs)

    const scheduleIds = new Set()

    todayLogs.forEach((log) => {
      if (log.medicationScheduleId) {
        const key = `${log.medicationId}-${log.medicationScheduleId}`
        scheduleIds.add(key)
      }
    })

    return scheduleIds
  }, [medicationLogs, today.dateString])

  // 오늘의 복용 스케줄 생성
  const todaySchedules = useMemo(() => {
    const schedules = []

    medications
      .filter((med) => med.active) // 복용 중인 약만 (일시중지 제외)
      .forEach((med) => {
        if (!med.schedules || med.schedules.length === 0) return

        // 각 약의 스케줄을 확인
        med.schedules
          .filter((schedule) => {
            // 스케줄이 활성화되어 있고, 오늘 요일이 포함되어 있는지 확인
            if (!schedule.active) return false
            if (!schedule.daysOfWeek) return false
            const days = schedule.daysOfWeek.split(',').map((d) => d.trim())
            return days.includes(today.dayOfWeek)
          })
          .forEach((schedule) => {
            const scheduleKey = `${med.id}-${schedule.id}`
            const isTaken = completedScheduleIds.has(scheduleKey)

            schedules.push({
              id: scheduleKey,
              medicationId: med.id,
              scheduleId: schedule.id,
              time: schedule.time,
              timeLabel: getTimeLabel(schedule.time),
              medications: [
                {
                  name: med.name,
                  dose: med.dosage || '',
                },
              ],
              // 상태 결정: 복용 완료 > 현재 시간 기준
              status: isTaken ? 'completed' : schedule.time <= today.currentTime ? 'pending' : 'scheduled',
              statusLabel: isTaken ? '복용 완료' : schedule.time <= today.currentTime ? '복용하기' : '예정',
              isActive: !isTaken && schedule.time <= today.currentTime,
            })
          })
      })

    // 시간순 정렬
    return schedules.sort((a, b) => a.time.localeCompare(b.time))
  }, [medications, today, completedScheduleIds])

  const handleTakeMedication = async (scheduleId) => {
    const [medicationId, schedId] = scheduleId.split('-')

    setLoading(true)
    try {
      // 오늘 날짜 + 스케줄 시간으로 scheduledTime 생성
      const schedule = todaySchedules.find((s) => s.id === scheduleId)
      if (!schedule) {
        throw new Error('Schedule not found')
      }

      // 시간 형식 확인 (HH:mm)
      const [hours, minutes] = schedule.time.split(':').map(Number)
      const scheduledTime = new Date(today.date)
      scheduledTime.setHours(hours, minutes, 0, 0)

      // 유효한 날짜인지 확인
      if (isNaN(scheduledTime.getTime())) {
        throw new Error('Invalid schedule time')
      }

      // Local ISO String 생성 (YYYY-MM-DDTHH:mm:ss)
      const offset = scheduledTime.getTimezoneOffset() * 60000
      const localIsoString = new Date(scheduledTime.getTime() - offset).toISOString().slice(0, 19)

      // Optimistic update: 즉시 UI 업데이트
      const optimisticLog = {
        medicationId: parseInt(medicationId),
        medicationScheduleId: parseInt(schedId),
        scheduledTime: localIsoString,
        completedTime: new Date().toISOString(),
        completed: true,
      }
      setMedicationLogs((prev) => [...prev, optimisticLog])

      await medicationLogApiClient.create({
        medicationId: parseInt(medicationId),
        medicationScheduleId: parseInt(schedId),
        scheduledTime: localIsoString, // Send Local Time
        completed: true,
      })

      // 복용 기록 목록 다시 로드 (서버 데이터로 동기화)
      await loadMedicationLogs()

      console.log('복용 완료:', scheduleId)
    } catch (error) {
      console.error('Failed to create medication log:', error)
      alert('복용 기록 저장에 실패했습니다.')
      // 에러 발생 시 다시 로드하여 원래 상태로 복구
      await loadMedicationLogs()
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (medicationId) => {
    // 약 관리 페이지로 이동하면서 해당 약의 상세 모달 열기
    navigate(ROUTE_PATHS.medicationManagement, {
      state: { selectedMedicationId: medicationId },
    })
  }

  const todayDate = today.date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <MainLayout userName="어르신" userRole="어르신" notificationCount={0}>
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>오늘의 복용</h1>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <QuickActions actions={SENIOR_QUICK_ACTIONS} />

        <div className={styles.medicationList}>
          {todaySchedules.length === 0 ? (
            <div className={styles.emptyState}>
              <p>오늘 복용할 약이 없습니다.</p>
              <p className={styles.emptyHint}>약 관리 페이지에서 약을 등록하고 스케줄을 설정해주세요.</p>
            </div>
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
        </div>

        <FAB actions={SENIOR_FAB_ACTIONS} />
      </div>
    </MainLayout>
  )
}

export default SeniorDashboard

/**
 * MyMedicationSchedule Component
 * - 본인의 오늘 복용 일정을 표시하고 관리하는 공통 컴포넌트
 * - SeniorDashboard와 CaregiverDashboard에서 재사용
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedicationCard } from './MedicationCard'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { ROUTE_PATHS } from '@/core/config/routes.config'
import { format } from 'date-fns'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import { toast } from '@shared/components/toast/toastStore' // [Voice]
import styles from './MyMedicationSchedule.module.scss'

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
      console.error('Failed to load medication logs:', error)
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
      const medication = medications.find((m) => m.id === log.medicationId)
      const scheduleTime = log.scheduledTime ? format(new Date(log.scheduledTime), 'HH:mm') : ''
      const isTaken = log.completed

      return {
        id: `${log.medicationId}-${log.medicationScheduleId}-${log.id || index}`,
        medicationId: log.medicationId,
        scheduleId: log.medicationScheduleId,
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

  // [Voice] 음성 명령 처리 (자동 복용 체크)
  useEffect(() => {
    if (!loading && todaySchedules.length > 0) {
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
          targetSchedules.forEach(s => handleTakeMedication(s.id))
          const countMsg = targetMedName ? `'${targetMedName}'` : `${targetSchedules.length}건`
          toast.success(`${timeSlot === 'NOW' ? '현재' : timeSlot} 시간대 ${countMsg}을(를) 복용 처리했습니다.`)
        } else {
          // 홈 화면에서는 토스트 메시지를 생략하거나 조용히 처리할 수도 있음
          // toast.info('해당하는 복용 일정이 없습니다.')
        }
      }
    }
  }, [loading, todaySchedules, consumeAction])

  const handleTakeMedication = async (scheduleId) => {
    const [medicationId, schedId] = scheduleId.split('-')

    try {
      // Optimistic update: 즉시 UI 업데이트
      const optimisticLog = {
        medicationId: parseInt(medicationId),
        medicationScheduleId: parseInt(schedId),
        completed: true,
        completedTime: new Date().toISOString(),
      }
      setMedicationLogs((prev) => [...prev, optimisticLog])

      // PATCH /medications/logs/{scheduleId}/complete 호출
      await medicationLogApiClient.completeMedication(parseInt(schedId))

      // 복용 기록 목록 다시 로드 (서버 데이터로 동기화)
      await loadMedicationLogs()

      console.log('복용 완료:', scheduleId)
    } catch (error) {
      console.error('Failed to complete medication:', error)
      alert('복용 기록 저장에 실패했습니다.')
      // 에러 발생 시 다시 로드하여 원래 상태로 복구
      await loadMedicationLogs()
    }
  }

  const handleCardClick = (medicationId) => {
    // 약 관리 페이지로 이동하면서 해당 약의 상세 모달 열기
    navigate(ROUTE_PATHS.medicationManagement, {
      state: { selectedMedicationId: medicationId },
    })
  }

  if (loading) {
    return (
      <div className={`${styles.scheduleSection} ${className}`}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.loadingState}>
          <p>복용 일정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!showEmptyState && todaySchedules.length === 0) {
    return null
  }

  return (
    <div className={`${styles.scheduleSection} ${className}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>

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
    </div>
  )
}

export default MyMedicationSchedule

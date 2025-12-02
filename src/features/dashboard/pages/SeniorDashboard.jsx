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
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { format } from 'date-fns'
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
  const { user } = useAuth((state) => ({ user: state.user }))
  const [exporting, setExporting] = useState(false)

  const loadMedicationLogs = useCallback(async () => {
    try {
      // 오늘 날짜의 로그만 조회
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
      const response = await medicationLogApiClient.getByDate(today)
      setMedicationLogs(response || [])
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
      console.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
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

        <FAB actions={fabActions} />
      </div>
    </MainLayout>
  )
}

export default SeniorDashboard

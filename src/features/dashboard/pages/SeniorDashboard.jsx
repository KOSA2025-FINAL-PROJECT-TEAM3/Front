/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (목데이터 기반)
 */

import { useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { MedicationCard } from '../components/MedicationCard'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
import { useFamilyStore } from '@features/family/store/familyStore'
import { useFamilyMemberDetail } from '@features/family/hooks/useFamilyMemberDetail'
import { FamilyMockService } from '@features/family/services/familyService'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './SeniorDashboard.module.scss'

const mapStatus = (label = '') => {
  if (label.includes('완료')) return { code: 'completed', label }
  if (label.includes('미복용') || label.includes('대기 중')) return { code: 'pending', label }
  if (label.includes('예정')) return { code: 'scheduled', label }
  return { code: 'scheduled', label }
}

const parseTime = (timeLabel = '') => {
  // e.g., "아침 08:00" → "08:00", timeLabel: "아침"
  const parts = timeLabel.split(' ')
  const time = parts.find((p) => p.includes(':')) || ''
  const label = parts[0] || timeLabel
  return { time: time || '', timeLabel: label }
}

export const SeniorDashboard = () => {
  const { members, initialized, initialize } = useFamilyStore((s) => ({
    members: s.members,
    initialized: s.initialized,
    initialize: s.initialize,
  }))

  useEffect(() => {
    if (!initialized) initialize().catch(() => {})
  }, [initialized, initialize])

  // 단순 정책: 첫 번째 SENIOR 멤버를 대상자로 사용 (Dev Mode 시드와 일치)
  const targetMemberId = useMemo(
    () => members.find((m) => m.role === 'SENIOR')?.id || null,
    [members],
  )
  const { data, refetch } = useFamilyMemberDetail(targetMemberId) // Get refetch function

  const scheduleList = useMemo(() => {
    const meds = data?.medications || []
    return meds.map((m, idx) => {
      const { time, timeLabel } = parseTime(m.timeLabel)
      const status = mapStatus(m.statusLabel)
      return {
        id: idx + 1,
        time: time || '',
        timeLabel,
        medications: [{ name: m.name, dose: '' }],
        status: status.code,
        statusLabel: status.label,
        isActive: status.code === 'pending',
      }
    })
  }, [data])

  const handleTakeMedication = useCallback(
    async (medicationId) => {
      if (!targetMemberId) return

      const medicationIndex = medicationId - 1 // Convert to 0-based index
      try {
        await FamilyMockService.updateMedicationStatus(
          targetMemberId,
          medicationIndex,
          '복용 완료', // New status label
        )
        refetch() // Re-fetch data to update UI
      } catch (error) {
        console.error('Failed to update medication status:', error)
        alert('약 복용 상태 업데이트에 실패했습니다.')
      }
    },
    [targetMemberId, refetch],
  )

  const todayDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const quickActions = [
    { icon: '💊', label: '약 등록', path: ROUTE_PATHS.medicationAdd },
    { icon: '🔍', label: '검색', path: ROUTE_PATHS.search },
    { icon: '🍽️', label: '식단 경고', path: ROUTE_PATHS.dietWarning },
    { icon: '📊', label: '복용 리포트', path: ROUTE_PATHS.adherenceReport },
  ]

  const fabActions = [
    { icon: '💊', label: '약 등록', path: ROUTE_PATHS.medicationAdd },
    { icon: '🔍', label: '검색', path: ROUTE_PATHS.search },
    { icon: '📷', label: '처방전 스캔', path: ROUTE_PATHS.ocrScan },
  ]

  return (
    <MainLayout userName="어르신" userRole="어르신" notificationCount={0}>
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>오늘의 복용</h1>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <QuickActions actions={quickActions} />

        <div className={styles.medicationList}>
          {scheduleList.map((schedule) => (
            <MedicationCard
              key={schedule.id}
              schedule={schedule}
              onTakeMedication={handleTakeMedication}
            />
          ))}
        </div>

        <FAB actions={fabActions} />
      </div>
    </MainLayout>
  )
}

export default SeniorDashboard

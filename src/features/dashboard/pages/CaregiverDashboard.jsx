import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useFamilyStore } from '@features/family/store/familyStore'
import { useFamilyMemberDetail } from '@features/family/hooks/useFamilyMemberDetail'
import MainLayout from '@shared/components/layout/MainLayout'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
import { CAREGIVER_QUICK_ACTIONS, CAREGIVER_FAB_ACTIONS } from '@/data/mockUiConstants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import styles from './CaregiverDashboard.module.scss'

/**
 * CaregiverDashboard - 보호자/케어기버용 대시보드
 * 가족 구성원 상태와 알림 위젯을 연동할 예정.
 */
export function CaregiverDashboard() {
  const navigate = useNavigate()
  const { members, loading, error, initialized, initialize } = useFamilyStore((state) => ({
    members: state.members,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    initialize: state.initialize,
  }))
  const { user } = useAuth((state) => ({ user: state.user }))
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initialize().catch(() => {})
    }
  }, [initialized, initialize])

  const seniorMembers = useMemo(
    () => members.filter((member) => member.role === 'SENIOR'),
    [members],
  )

  const handleViewDetail = (memberId) => {
    navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
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

  const fabActions = CAREGIVER_FAB_ACTIONS.map((action) => {
    if (action.id === 'pdf_export') {
      return {
        ...action,
        label: exporting ? '다운로드 중...' : action.label,
        onClick: () => !exporting && handleExportPdf(),
      }
    }
    return action
  })

  if (loading && members.length === 0) {
    return (
      <MainLayout userName="보호자" userRole="보호자">
        <p className={styles.stateMessage}>가족 데이터를 불러오는 중...</p>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout userName="보호자" userRole="보호자">
        <p className={styles.stateMessage}>가족 데이터를 불러오지 못했습니다. {error.message}</p>
      </MainLayout>
    )
  }

  return (
    <MainLayout userName="보호자" userRole="보호자">
      <section className={styles.dashboard}>
        <header className={styles.header}>
          <h1>보호자 대시보드</h1>
          <p>가족 구성원의 오늘 복약 상태를 빠르게 확인할 수 있습니다.</p>
        </header>

        <QuickActions actions={CAREGIVER_QUICK_ACTIONS} />

        <article className={styles.card}>
          <h2>어르신 복약 현황</h2>
          {seniorMembers.length === 0 && <p>등록된 어르신이 없습니다.</p>}

          <ul className={styles.memberList}>
            {seniorMembers.map((member) => (
              <SeniorMedicationSnapshot
                key={member.id}
                member={member}
                onDetail={() => handleViewDetail(member.id)}
              />
            ))}
          </ul>
        </article>

        <FAB actions={fabActions} />
      </section>
    </MainLayout>
  )
}

export default CaregiverDashboard

const SeniorMedicationSnapshot = ({ member, onDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [todayLogs, setTodayLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const { data, isLoading } = useFamilyMemberDetail(member.id)
  const medications = data?.medications ?? []
  const relation =
    member.relation || data?.member?.relation || (member.role === 'SENIOR' ? '어르신' : '보호자')

  // 오늘 복약 일정 조회
  const loadTodayLogs = async () => {
    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    setLogsLoading(true)
    try {
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
      const response = await medicationLogApiClient.getByDate(today)

      // 해당 member의 logs만 필터링
      const memberLogs = (response || []).filter(log => {
        const med = medications.find(m => m.id === log.medicationId)
        return med && med.userId === member.id
      })

      setTodayLogs(memberLogs)
      setIsExpanded(true)
    } catch (error) {
      console.error('Failed to load today logs:', error)
      setTodayLogs([])
      setIsExpanded(true)
    } finally {
      setLogsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#00B300'
      case 'pending':
        return '#FF9900'
      case 'scheduled':
        return '#CCCCCC'
      default:
        return '#999999'
    }
  }

  const getStatusLabel = (completed, scheduledTime) => {
    if (completed) return '복용완료'
    const scheduled = new Date(scheduledTime)
    const now = new Date()
    const diffHours = (now - scheduled) / (1000 * 60 * 60)
    if (diffHours > 1) return '미복용'
    if (now > scheduled) return '복용하기'
    return '예정'
  }

  const completedToday = todayLogs.filter(log => log.completed).length
  const missedToday = todayLogs.filter(log => !log.completed && (new Date(log.scheduledTime) < new Date())).length
  const pendingToday = todayLogs.length - completedToday - missedToday

  return (
    <li className={styles.memberItem}>
      <div className={styles.memberMeta}>
        <div>
          <strong>{member.name}</strong>
          <span className={styles.relation}> · {relation}</span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={loadTodayLogs}
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            aria-label="복약 일정 펼치기"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button type="button" onClick={onDetail} className={styles.detailButton}>
            자세히 보기
          </button>
        </div>
      </div>

      {/* 아코디언 섹션 - 펼쳐졌을 때만 표시 */}
      {isExpanded && (
        <div className={styles.accordion}>
          {/* 통계 요약 */}
          <div className={styles.stats}>
            <span className={styles.stat}>
              <strong style={{ color: '#00B300' }}>{completedToday}</strong>
              <small>완료</small>
            </span>
            <span className={styles.stat}>
              <strong style={{ color: '#FF9900' }}>{pendingToday}</strong>
              <small>예정</small>
            </span>
            <span className={styles.stat}>
              <strong style={{ color: '#FF0000' }}>{missedToday}</strong>
              <small>미복용</small>
            </span>
          </div>

          {/* 로그 리스트 */}
          {logsLoading ? (
            <p className={styles.loadingRow}>오늘 복약 일정을 불러오는 중...</p>
          ) : (
            <ul className={styles.medList}>
              {todayLogs.map((log, index) => {
                const status = getStatusLabel(log.completed, log.scheduledTime)
                const time = new Date(log.scheduledTime).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const med = medications.find(m => m.id === log.medicationId)

                return (
                  <li
                    key={`${member.id}-${index}`}
                    className={styles.medRow}
                    style={{ borderLeftColor: getStatusColor(log.completed ? 'completed' : 'pending') }}
                  >
                    <span className={styles.medTime}>{time}</span>
                    <span className={styles.medName}>{med?.name || '알 수 없는 약'}</span>
                    <span className={styles.medStatus} style={{ color: getStatusColor(log.completed ? 'completed' : 'pending') }}>
                      {status}
                    </span>
                  </li>
                )
              })}
              {todayLogs.length === 0 && (
                <li className={styles.emptyRow}>오늘 복약 일정이 없습니다.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useFamilyStore } from '@features/family/store/familyStore'
import { useFamilyMemberDetail } from '@features/family/hooks/useFamilyMemberDetail'
import MainLayout from '@shared/components/layout/MainLayout'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
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

  const quickActions = [
    { icon: '👥', label: '가족 관리', path: ROUTE_PATHS.family },
    { icon: '💊', label: '약 관리', path: ROUTE_PATHS.medication },
    { icon: '🔍', label: '검색', path: ROUTE_PATHS.search },
    { icon: '💬', label: '상담', path: ROUTE_PATHS.chatList },
  ]

  const fabActions = [
    { icon: '👥', label: '가족 초대', path: ROUTE_PATHS.familyInvite },
    { icon: '💊', label: '약 등록', path: ROUTE_PATHS.medicationAdd },
    { icon: '🔍', label: '검색', path: ROUTE_PATHS.search },
  ]

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

        <QuickActions actions={quickActions} />

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
  const { data, isLoading } = useFamilyMemberDetail(member.id)
  const medications = data?.medications ?? []
  const relation =
    member.relation || data?.member?.relation || (member.role === 'SENIOR' ? '어르신' : '보호자')

  return (
    <li className={styles.memberItem}>
      <div className={styles.memberMeta}>
        <div>
          <strong>{member.name}</strong>
          <span className={styles.relation}> · {relation}</span>
        </div>
        <button type="button" onClick={onDetail} className={styles.detailButton}>
          자세히 보기
        </button>
      </div>

      {isLoading ? (
        <p className={styles.loadingRow}>복약 정보를 불러오는 중...</p>
      ) : (
        <ul className={styles.medList}>
          {medications.map((med, index) => (
            <li key={`${member.id}-${index}`} className={styles.medRow}>
              <span className={styles.medTime}>{med.timeLabel}</span>
              <span className={styles.medName}>{med.name}</span>
              <span className={styles.medStatus}>{med.statusLabel}</span>
            </li>
          ))}
          {medications.length === 0 && (
            <li className={styles.emptyRow}>등록된 복약 일정이 없습니다.</li>
          )}
        </ul>
      )}
    </li>
  )
}

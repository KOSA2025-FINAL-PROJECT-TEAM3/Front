/**
 * Guardian Dashboard Page
 * - 보호자용 가족별 복용 모니터링 대시보드
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { MainLayout } from '@/shared/components/layout/MainLayout'
import { FamilyMemberCard } from './FamilyMemberCard'
import { useFamilyStore } from '@/stores/familyStore'
import styles from './GuardianDashboard.module.scss'

export const GuardianDashboard = () => {
  const navigate = useNavigate()
  const { members, initialized, initialize } = useFamilyStore((s) => ({
    members: s.members,
    initialized: s.initialized,
    initialize: s.initialize,
  }))

  useEffect(() => {
    if (!initialized) initialize().catch(() => {})
  }, [initialized, initialize])

  const todayDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <MainLayout userName="보호자" userRole="보호자" notificationCount={2}>
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>가족 돌봄 센터</h1>
          <p className={styles.subtitle}>가족별 복용 현황</p>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <div className={styles.familyGrid}>
          {members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onDetail={(id) =>
                navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', String(id)))
              }
            />
          ))}
        </div>

        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>오늘의 요약</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>6</span>
              <span className={styles.statLabel}>예정</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>4</span>
              <span className={styles.statLabel}>복용 완료</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>미복용</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default GuardianDashboard


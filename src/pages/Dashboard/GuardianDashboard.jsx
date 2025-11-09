/**
 * Guardian Dashboard Page
 * - 보호자용 가족 약 복용 모니터링 대시보드
 */

import { MainLayout } from '@/shared/components/layout/MainLayout'
import { FamilyMemberCard } from './FamilyMemberCard'
import styles from './GuardianDashboard.module.scss'

/**
 * 보호자 대시보드 페이지
 * @returns {JSX.Element} 보호자 대시보드
 */
export const GuardianDashboard = () => {
  // 예시 데이터: 가족 구성원들의 약 복용 상황
  const familyMembers = [
    {
      id: 1,
      name: '김철수',
      relation: '배우자',
      age: 72,
      todayStatus: {
        scheduled: 3,
        completed: 2,
        missed: 0
      },
      lastMedicationTime: '12:30',
      nextMedicationTime: '19:00'
    },
    {
      id: 2,
      name: '김민지',
      relation: '딸',
      age: 45,
      todayStatus: {
        scheduled: 2,
        completed: 1,
        missed: 0
      },
      lastMedicationTime: '08:00',
      nextMedicationTime: '20:00'
    },
    {
      id: 3,
      name: '김준호',
      relation: '아들',
      age: 42,
      todayStatus: {
        scheduled: 1,
        completed: 1,
        missed: 0
      },
      lastMedicationTime: '09:00',
      nextMedicationTime: '없음'
    }
  ]

  const todayDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <MainLayout
      userName="김영희"
      userRole="보호자"
      notificationCount={2}
    >
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>가족 돌봄 센터</h1>
          <p className={styles.subtitle}>실시간 가족 약 복용 현황</p>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <div className={styles.familyGrid}>
          {familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
            />
          ))}
        </div>

        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>오늘의 통계</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>6</span>
              <span className={styles.statLabel}>예정된 약</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>4</span>
              <span className={styles.statLabel}>복용 완료</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>복용 안 함</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default GuardianDashboard

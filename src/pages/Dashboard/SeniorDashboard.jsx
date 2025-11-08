/**
 * Senior Dashboard Page
 * - 시니어용 약 복용 일정 관리 대시보드
 */

import { MainLayout } from '../../components/layout/MainLayout'
import { MedicationCard } from './MedicationCard'
import styles from './SeniorDashboard.module.css'

/**
 * 시니어 대시보드 페이지
 * @returns {JSX.Element} 시니어 대시보드
 */
export const SeniorDashboard = () => {
  // 예시 데이터
  const medicationSchedule = [
    {
      id: 1,
      time: '08:00',
      timeLabel: '아침',
      medications: [
        { name: '비타민 D', dose: '1정' },
        { name: '종합감기약', dose: '2정' }
      ],
      status: 'completed',
      statusLabel: '복용 완료 ✓'
    },
    {
      id: 2,
      time: '12:30',
      timeLabel: '점심',
      medications: [
        { name: '혈압약', dose: '1정' },
        { name: '당뇨약', dose: '1정' }
      ],
      status: 'pending',
      statusLabel: '지금 복용하기',
      isActive: true
    },
    {
      id: 3,
      time: '19:00',
      timeLabel: '저녁',
      medications: [
        { name: '소화제', dose: '1정' }
      ],
      status: 'scheduled',
      statusLabel: '예정'
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
      userName="김철수"
      userRole="시니어"
      notificationCount={0}
    >
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>오늘의 약 복용</h1>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <div className={styles.medicationList}>
          {medicationSchedule.map((schedule) => (
            <MedicationCard
              key={schedule.id}
              schedule={schedule}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default SeniorDashboard

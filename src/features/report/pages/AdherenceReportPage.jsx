/**
 * 복약 순응도 리포트 페이지
 * @page 31-adherence-report
 * @component AdherenceReportPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/ui/BackButton'
import { MOCK_ADHERENCE_PAGE_DATA, MOCK_RECENT_HISTORY } from '@/data/mockReports'
import styles from './AdherenceReportPage.module.scss'

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  // TODO: API 연동 시 실제 데이터로 교체
  const adherenceData = MOCK_ADHERENCE_PAGE_DATA
  const recentHistory = MOCK_RECENT_HISTORY

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '✓ 완료'
      case 'partial':
        return '⚠ 일부'
      case 'missed':
        return '✕ 누락'
      default:
        return ''
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return styles.completed
      case 'partial':
        return styles.partial
      case 'missed':
        return styles.missed
      default:
        return ''
    }
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>복약 순응도 리포트</h1>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.overallScore}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>{adherenceData.overall}%</span>
            </div>
            <p className={styles.scoreLabel}>전체 복약 순응도</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{adherenceData.thisWeek}%</span>
              <span className={styles.statLabel}>이번 주</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{adherenceData.thisMonth}%</span>
              <span className={styles.statLabel}>이번 달</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{adherenceData.streak}일</span>
              <span className={styles.statLabel}>연속 복용</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>최근 복약 기록</h2>
          <div className={styles.historyList}>
            {recentHistory.map((day, index) => (
              <div key={index} className={`${styles.historyItem} ${getStatusClass(day.status)}`}>
                <div className={styles.historyDate}>
                  <span className={styles.dayLabel}>
                    {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={styles.weekday}>
                    {new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                  </span>
                </div>
                <div className={styles.historyProgress}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(day.count / day.total) * 100}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {day.count}/{day.total}
                  </span>
                </div>
                <span className={styles.historyStatus}>{getStatusLabel(day.status)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.insight}>
          <h3 className={styles.insightTitle}>💡 인사이트</h3>
          <ul className={styles.insightList}>
            <li>지난 2주간 꾸준히 복용하고 계십니다! 잘하고 계세요. 👏</li>
            <li>주말 복약 누락률이 높습니다. 알림을 설정해보세요.</li>
            <li>현재 순응도로 치료 목표를 달성할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}

export default AdherenceReportPage

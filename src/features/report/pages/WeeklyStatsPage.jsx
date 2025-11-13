/**
 * 주간 통계 페이지
 * @page 32-weekly-stats
 * @component WeeklyStatsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './WeeklyStatsPage.module.scss'

/**
 * 주간 통계 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const WeeklyStatsPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>주간 통계</h1>
        <p className={styles.placeholder}>주간 통계 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default WeeklyStatsPage

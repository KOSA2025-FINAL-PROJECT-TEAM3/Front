/**
 * 복약 순응도 리포트 페이지
 * @page 31-adherence-report
 * @component AdherenceReportPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './AdherenceReportPage.module.scss'

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>복약 순응도 리포트</h1>
        <p className={styles.placeholder}>복약 순응도 리포트 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default AdherenceReportPage

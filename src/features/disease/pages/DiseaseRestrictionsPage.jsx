/**
 * 질병별 제약 사항 페이지
 * @page 20-disease-restrictions
 * @component DiseaseRestrictionsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './DiseaseRestrictionsPage.module.scss'

/**
 * 질병별 제약 사항 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const DiseaseRestrictionsPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>질병별 제약 사항</h1>
        <p className={styles.placeholder}>질병별 제약 사항 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default DiseaseRestrictionsPage

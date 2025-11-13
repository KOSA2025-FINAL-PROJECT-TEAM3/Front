/**
 * 약 편집 페이지
 * @page 10-medication-edit
 * @component MedicationEditPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './MedicationEditPage.module.scss'

/**
 * 약 편집 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MedicationEditPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>약 편집</h1>
        <p className={styles.placeholder}>약 편집 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default MedicationEditPage

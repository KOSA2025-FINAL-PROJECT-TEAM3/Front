/**
 * 약 등록 페이지
 * @page 08-medication-add
 * @component MedicationAddPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './MedicationAddPage.module.scss'

/**
 * 약 등록 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MedicationAddPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>약 등록</h1>
        <p className={styles.placeholder}>약 등록 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default MedicationAddPage

/**
 * 의심 질환 결과 페이지
 * @page 17-suspected-disease
 * @component SuspectedDiseasePage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './SuspectedDiseasePage.module.scss'

/**
 * 의심 질환 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const SuspectedDiseasePage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>의심 질환 결과</h1>
        <p className={styles.placeholder}>의심 질환 결과 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default SuspectedDiseasePage

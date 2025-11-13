/**
 * 알약 검색 결과 페이지
 * @page 14-pill-result
 * @component PillResultPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './PillResultPage.module.scss'

/**
 * 알약 검색 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const PillResultPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>알약 검색 결과</h1>
        <p className={styles.placeholder}>알약 검색 결과 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default PillResultPage

/**
 * 알약 역검색 페이지
 * @page 13-pill-search
 * @component PillSearchPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './PillSearchPage.module.scss'

/**
 * 알약 역검색 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const PillSearchPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>알약 역검색</h1>
        <p className={styles.placeholder}>알약 역검색 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default PillSearchPage

/**
 * 통합 검색 페이지 (증상 검색 + 알약 검색)
 * @page unified-search
 * @component UnifiedSearchPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Tabs } from '@shared/components/ui/Tabs'
import { SymptomSearchTab } from '@features/search/components/SymptomSearchTab'
import { PillSearchTab } from '@features/search/components/PillSearchTab'
import styles from './UnifiedSearchPage.module.scss'

/**
 * 통합 검색 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const UnifiedSearchPage = () => {
  const tabs = [
    {
      id: 'symptom',
      label: '증상 검색',
      content: <SymptomSearchTab />,
    },
    {
      id: 'pill',
      label: '알약 검색',
      content: <PillSearchTab />,
    },
  ]

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>검색</h1>
          <p>증상이나 알약을 검색하여 정보를 확인하세요.</p>
        </header>

        <div className={styles.tabsContainer}>
          <Tabs tabs={tabs} defaultTab="symptom" />
        </div>
      </div>
    </MainLayout>
  )
}

export default UnifiedSearchPage

/**
 * 통합 검색 페이지 (증상 검색 + 알약 검색)
 * @page unified-search
 * @component UnifiedSearchPage
 */

import { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { Tabs } from '@shared/components/ui/Tabs'
import { SymptomSearchTab } from '@features/search/components/SymptomSearchTab'
import { PillSearchTab } from '@features/search/components/PillSearchTab'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import styles from './UnifiedSearchPage.module.scss'

/**
 * 통합 검색 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const UnifiedSearchPage = () => {
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const [initialTab, setInitialTab] = useState('symptom')

  useEffect(() => {
    // 실시간으로 대기 중인 액션 감지하여 탭 전환
    if (pendingAction && pendingAction.code === 'AUTO_SEARCH') {
      const type = pendingAction.params?.searchType // 'PILL' or 'SYMPTOM'
      if (type === 'PILL') {
        setInitialTab('pill')
      } else if (type === 'SYMPTOM') {
        setInitialTab('symptom')
      }
    }
  }, [pendingAction])

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

  // initialTab이 변경되면 Tabs를 다시 렌더링하도록 key를 부여
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>검색</h1>
          <p>증상이나 알약을 검색하여 정보를 확인하세요.</p>
        </header>

        <div className={styles.tabsContainer}>
          <Tabs key={initialTab} tabs={tabs} defaultTab={initialTab} />
        </div>
      </div>
    </MainLayout>
  )
}

export default UnifiedSearchPage
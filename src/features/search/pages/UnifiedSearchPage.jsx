/**
 * 통합 검색 페이지 (증상 검색 + 알약 검색)
 * @page unified-search
 * @component UnifiedSearchPage
 */

import { useEffect, useState } from 'react'
import { Box, Container, Tab, Tabs, Typography } from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'
import { SymptomSearchTab } from '@features/search/components/SymptomSearchTab'
import { PillSearchTab } from '@features/search/components/PillSearchTab'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]

/**
 * 통합 검색 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const UnifiedSearchPage = () => {
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const [initialTab, setInitialTab] = useState('symptom')
  const [activeTab, setActiveTab] = useState('symptom')

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

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pill':
        return <PillSearchTab />
      case 'symptom':
      default:
        return <SymptomSearchTab />
    }
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            검색
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            증상이나 알약을 검색하여 정보를 확인하세요.
          </Typography>
        </Box>

        <Box>
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            aria-label="검색 탭"
          >
            <Tab value="symptom" label="증상 검색" />
            <Tab value="pill" label="알약 검색" />
          </Tabs>

          <Box sx={{ pt: 2 }}>
            {renderTabContent()}
          </Box>
        </Box>
      </Container>
    </MainLayout>
  )
}

export default UnifiedSearchPage

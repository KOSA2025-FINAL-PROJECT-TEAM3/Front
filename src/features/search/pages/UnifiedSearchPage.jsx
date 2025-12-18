/**
 * 통합 검색 페이지 (증상 검색 + 알약 검색)
 * @page unified-search
 * @component UnifiedSearchPage
 */

import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Chip, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'
import { PillSearchTab } from '@features/search/components/PillSearchTab'
import { DietSearchTab } from '@features/search/components/DietSearchTab'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'
import { BackButton } from '@shared/components/mui/BackButton'

/**
 * 통합 검색 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const UnifiedSearchPage = () => {
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const [initialTab, setInitialTab] = useState('pill')
  const [activeTab, setActiveTab] = useState('pill')
  const { history, clearAll, requestSearch } = useSearchHistoryStore((state) => ({
    history: state.history,
    clearAll: state.clearAll,
    requestSearch: state.requestSearch,
  }))

  useEffect(() => {
    // 실시간으로 대기 중인 액션 감지하여 탭 전환
    if (pendingAction && pendingAction.code === 'AUTO_SEARCH') {
      const type = pendingAction.params?.searchType // 'PILL' | 'DIET'
      if (type === 'PILL') {
        setInitialTab('pill')
      } else if (type === 'DIET') {
        setInitialTab('diet')
      }
    }
  }, [pendingAction])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const RecentSection = useMemo(
    () => (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            최근 검색어
          </Typography>
          {(history || []).length > 0 ? (
            <Button
              variant="text"
              onClick={() => clearAll()}
              sx={{ fontSize: 12, fontWeight: 900, color: 'text.disabled' }}
            >
              전체 삭제
            </Button>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {(history || []).slice(0, 10).map((item) => (
            <Chip
              key={item.id}
              label={item.term}
              onClick={() => requestSearch(activeTab, item.term, 'default')}
              sx={{ fontWeight: 800 }}
            />
          ))}
          {(history || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              최근 검색 기록이 없습니다.
            </Typography>
          ) : null}
        </Stack>
      </Paper>
    ),
    [activeTab, clearAll, history, requestSearch],
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pill':
        return <PillSearchTab layout="overlay" recentSection={RecentSection} />
      case 'diet':
      default:
        return <DietSearchTab layout="overlay" recentSection={RecentSection} />
    }
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="검색" subtitle="약을 검색하거나 식단을 분석해보세요." />

        <Stack spacing={2}>
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            aria-label="검색 탭"
            variant="fullWidth"
          >
            <Tab value="pill" label="약" />
            <Tab value="diet" label="식단" />
          </Tabs>

          <Box sx={{ pt: 2 }}>
            {renderTabContent()}
          </Box>
        </Stack>
      </PageStack>
    </MainLayout>
  )
}

export default UnifiedSearchPage

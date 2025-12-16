import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyMedicationList from '../components/FamilyMedicationList.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'
import MedicationLogsTab from '../components/MedicationLogsTab.jsx'
import MedicationDetailTab from '../components/MedicationDetailTab.jsx'
import DietLogsTab from '../components/DietLogsTab.jsx'
import { useFamilyStore } from '../store/familyStore'

export const FamilyMemberDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { familyLoading, familyInitialized } = useFamilyStore((state) => ({
    familyLoading: state.loading,
    familyInitialized: state.initialized,
  }))
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const [activeTab, setActiveTab] = useState('medications')

  const member = data?.member
  const medications = data?.medications ?? []
  const pageLoading = familyLoading || !familyInitialized || isLoading

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['medications', 'medication-logs', 'logs', 'detail'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Optional: Update URL without reload to reflect tab change
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('tab', tab)
    window.history.pushState({}, '', newUrl)
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Button type="button" variant="text" onClick={() => navigate(ROUTE_PATHS.family)} sx={{ px: 0 }}>
          가족 관리로 돌아가기
        </Button>

        {pageLoading && (
          <Paper variant="outlined" sx={{ mt: 2, p: 4 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                구성원 정보를 불러오는 중입니다...
              </Typography>
            </Stack>
          </Paper>
        )}
        {!pageLoading && error ? <Alert severity="error" sx={{ mt: 2 }}>구성원 정보를 불러오지 못했습니다. 다시 시도해 주세요.</Alert> : null}
        {!pageLoading && !error && !member && (
          <Alert severity="warning" sx={{ mt: 2 }}>구성원을 찾을 수 없습니다.</Alert>
        )}

        {!pageLoading && member && (
          <>
            <MemberProfileCard member={member} />

            <Paper variant="outlined" sx={{ mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, nextValue) => handleTabChange(nextValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="약 목록" value="medications" />
                <Tab label="복약 기록" value="medication-logs" />
                <Tab label="식단 기록" value="logs" />
                <Tab label="상세 정보" value="detail" />
              </Tabs>
              <Box sx={{ p: 2 }}>
                {activeTab === 'medications' && (
                  <FamilyMedicationList medications={medications} />
                )}
                {activeTab === 'medication-logs' && (
                  <MedicationLogsTab userId={Number(member.userId)} />
                )}
                {activeTab === 'logs' && (
                  <DietLogsTab userId={Number(member.userId)} />
                )}
                {activeTab === 'detail' && (
                  <MedicationDetailTab userId={member.userId} medications={medications} />
                )}
              </Box>
            </Paper>

          </>
        )}
      </Container>
    </MainLayout>
  )
}

export default FamilyMemberDetailPage

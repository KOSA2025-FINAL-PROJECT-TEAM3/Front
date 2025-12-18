import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'

import MainLayout from '@shared/components/layout/MainLayout'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { ROUTE_PATHS } from '@config/routes.config'

import MemberProfileCard from '../components/MemberProfileCard.jsx'
import MedicationLogsTab from '../components/MedicationLogsTab.jsx'
import MedicationDetailTab from '../components/MedicationDetailTab.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'

export const FamilyMemberMedicationPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const member = data?.member
  const medications = data?.medications ?? []

  const userId = useMemo(() => member?.userId ?? null, [member?.userId])
  const [tab, setTab] = useState('logs') // logs | medications

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton onClick={() => navigate(ROUTE_PATHS.family)} label="가족" />}
          title="복약 관리"
          subtitle={member?.name ? `${member.name} 님` : null}
        />

        {isLoading ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                구성원 정보를 불러오는 중입니다...
              </Typography>
            </Stack>
          </Paper>
        ) : error ? (
          <Alert severity="error">구성원 정보를 불러오지 못했습니다. 다시 시도해 주세요.</Alert>
        ) : !member ? (
          <Alert severity="warning">구성원을 찾을 수 없습니다.</Alert>
        ) : (
          <>
            <MemberProfileCard member={member} />

            <Paper variant="outlined" sx={{ borderRadius: 3 }}>
              <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth">
                <Tab value="logs" label="복약 기록" />
                <Tab value="medications" label="약 목록" />
              </Tabs>
            </Paper>

            <Box sx={{ pt: 1 }}>
              {tab === 'logs' ? (
                userId ? (
                  <MedicationLogsTab userId={Number(userId)} />
                ) : (
                  <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
                )
              ) : userId ? (
                <MedicationDetailTab userId={Number(userId)} medications={medications} />
              ) : (
                <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
              )}
            </Box>
          </>
        )}
      </PageStack>
    </MainLayout>
  )
}

export default FamilyMemberMedicationPage


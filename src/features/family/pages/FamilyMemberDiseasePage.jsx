import { useNavigate, useParams } from 'react-router-dom'
import { Alert, CircularProgress, Paper, Stack, Typography } from '@mui/material'

import MainLayout from '@shared/components/layout/MainLayout'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { ROUTE_PATHS } from '@config/routes.config'

import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyDiseasesTab from '../components/FamilyDiseasesTab.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'

export const FamilyMemberDiseasePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const member = data?.member

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton onClick={() => navigate(ROUTE_PATHS.family)} label="가족" />}
          title="질병 관리"
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
            {member?.userId ? <FamilyDiseasesTab userId={Number(member.userId)} /> : <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>}
          </>
        )}
      </PageStack>
    </MainLayout>
  )
}

export default FamilyMemberDiseasePage

/**
 * 내 질병 관리 (설정) 페이지
 * @page 39-my-diseases-settings
 * @component MyDiseasesSettingsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Typography } from '@mui/material'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'

/**
 * 내 질병 관리 (설정) 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MyDiseasesSettingsPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader title="내 질병 관리 (설정)" leading={<BackButton />} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          내 질병 관리 (설정) 페이지 - 구현 예정
        </Typography>
      </PageStack>
    </MainLayout>
  )
}

export default MyDiseasesSettingsPage

/**
 * 내 질병 관리 (설정) 페이지
 * @page 39-my-diseases-settings
 * @component MyDiseasesSettingsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Container, Typography } from '@mui/material'

/**
 * 내 질병 관리 (설정) 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MyDiseasesSettingsPage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          내 질병 관리 (설정)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          내 질병 관리 (설정) 페이지 - 구현 예정
        </Typography>
      </Container>
    </MainLayout>
  )
}

export default MyDiseasesSettingsPage

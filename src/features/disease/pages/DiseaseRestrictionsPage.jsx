/**
 * 질병별 제약 사항 페이지
 * @page 20-disease-restrictions
 * @component DiseaseRestrictionsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Container, Typography } from '@mui/material'

/**
 * 질병별 제약 사항 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const DiseaseRestrictionsPage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          질병별 제약 사항
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          질병별 제약 사항 페이지 - 구현 예정
        </Typography>
      </Container>
    </MainLayout>
  )
}

export default DiseaseRestrictionsPage

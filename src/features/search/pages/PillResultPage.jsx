/**
 * 알약 검색 결과 페이지
 * @page 14-pill-result
 * @component PillResultPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Container, Typography } from '@mui/material'

/**
 * 알약 검색 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const PillResultPage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          알약 검색 결과
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          알약 검색 결과 페이지 - 구현 예정
        </Typography>
      </Container>
    </MainLayout>
  )
}

export default PillResultPage

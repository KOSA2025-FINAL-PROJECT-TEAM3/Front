/**
 * 의심 질환 결과 페이지
 * @page 17-suspected-disease
 * @component SuspectedDiseasePage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Container, Typography } from '@mui/material'

/**
 * 의심 질환 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const SuspectedDiseasePage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          의심 질환 결과
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          의심 질환 결과 페이지 - 구현 예정
        </Typography>
      </Container>
    </MainLayout>
  )
}

export default SuspectedDiseasePage

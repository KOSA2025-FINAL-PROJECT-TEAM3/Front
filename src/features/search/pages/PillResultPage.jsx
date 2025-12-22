/**
 * 알약 검색 결과 페이지
 * @page 14-pill-result
 * @component PillResultPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Typography } from '@mui/material'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'

/**
 * 알약 검색 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const PillResultPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader title="알약 검색 결과" leading={<BackButton />} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          알약 검색 결과 페이지 - 구현 예정
        </Typography>
      </PageStack>
    </MainLayout>
  )
}

export default PillResultPage

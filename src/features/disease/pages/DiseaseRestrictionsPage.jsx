/**
 * 질병별 제약 사항 페이지
 * @page 20-disease-restrictions
 * @component DiseaseRestrictionsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Typography } from '@mui/material'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'

/**
 * 질병별 제약 사항 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const DiseaseRestrictionsPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader title="질병별 제약 사항" leading={<BackButton />} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          질병별 제약 사항 페이지 - 구현 예정
        </Typography>
      </PageStack>
    </MainLayout>
  )
}

export default DiseaseRestrictionsPage

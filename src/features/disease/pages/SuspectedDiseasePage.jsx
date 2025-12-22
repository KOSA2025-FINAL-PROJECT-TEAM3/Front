/**
 * 의심 질환 결과 페이지
 * @page 17-suspected-disease
 * @component SuspectedDiseasePage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import { Typography } from '@mui/material'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'

/**
 * 의심 질환 결과 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const SuspectedDiseasePage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader title="의심 질환 결과" leading={<BackButton />} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          의심 질환 결과 페이지 - 구현 예정
        </Typography>
      </PageStack>
    </MainLayout>
  )
}

export default SuspectedDiseasePage

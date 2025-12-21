import MainLayout from '@shared/components/layout/MainLayout'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { PlaceSearchTab } from '../components/PlaceSearchTab'

const PlaceSearchPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="병원/약국"
          subtitle="Kakao Maps 기반 주변 검색"
        />
        <PlaceSearchTab />
      </PageStack>
    </MainLayout>
  )
}

export default PlaceSearchPage

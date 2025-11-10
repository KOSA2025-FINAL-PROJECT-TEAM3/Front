import { useParams, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyMedicationList from '../components/FamilyMedicationList.jsx'
import FamilyAdherenceChart from '../components/FamilyAdherenceChart.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'
import styles from './FamilyMemberDetail.module.scss'

export const FamilyMemberDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useFamilyMemberDetail(id)

  const member = data?.member
  const medications = data?.medications ?? []
  const adherence = data?.adherence ?? 0

  return (
    <MainLayout>
      <div className={styles.page}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(ROUTE_PATHS.family)}
        >
          가족 관리로 돌아가기
        </button>

        {isLoading && (
          <p className={styles.loading}>구성원 정보를 불러오는 중입니다...</p>
        )}
        {error && (
          <p className={styles.error}>
            구성원 정보를 불러오지 못했습니다. 다시 시도해 주세요.
          </p>
        )}
        {!isLoading && !error && !member && (
          <p className={styles.empty}>구성원을 찾을 수 없습니다.</p>
        )}

        {member && (
          <>
            <MemberProfileCard member={member} />
            <FamilyMedicationList medications={medications} />
            <FamilyAdherenceChart adherence={adherence} />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyMemberDetailPage


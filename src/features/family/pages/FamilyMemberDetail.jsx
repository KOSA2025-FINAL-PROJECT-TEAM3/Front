import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyMedicationList from '../components/FamilyMedicationList.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'
import MedicationLogsTab from '../components/MedicationLogsTab.jsx'
import MedicationDetailTab from '../components/MedicationDetailTab.jsx'
import styles from './FamilyMemberDetail.module.scss'

export const FamilyMemberDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const [activeTab, setActiveTab] = useState('medications')

  const member = data?.member
  const medications = data?.medications ?? []

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

            <div className={styles.tabContainer}>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'medications' ? styles.active : ''}`}
                  onClick={() => setActiveTab('medications')}
                >
                  약 목록
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  복약 기록
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'detail' ? styles.active : ''}`}
                  onClick={() => setActiveTab('detail')}
                >
                  상세 정보
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'medications' && (
                  <FamilyMedicationList medications={medications} />
                )}
                {activeTab === 'logs' && (
                  <MedicationLogsTab userId={parseInt(id)} />
                )}
                {activeTab === 'detail' && (
                  <MedicationDetailTab userId={parseInt(id)} medications={medications} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyMemberDetailPage


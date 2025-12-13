import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyMedicationList from '../components/FamilyMedicationList.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'
import MedicationLogsTab from '../components/MedicationLogsTab.jsx'
import MedicationDetailTab from '../components/MedicationDetailTab.jsx'
import DietLogsTab from '../components/DietLogsTab.jsx'
import { useFamilyStore } from '../store/familyStore'
import styles from './FamilyMemberDetail.module.scss'

export const FamilyMemberDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { familyLoading, familyInitialized } = useFamilyStore((state) => ({
    familyLoading: state.loading,
    familyInitialized: state.initialized,
  }))
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const [activeTab, setActiveTab] = useState('medications')

  const member = data?.member
  const medications = data?.medications ?? []
  const pageLoading = familyLoading || !familyInitialized || isLoading

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['medications', 'medication-logs', 'logs', 'detail'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Optional: Update URL without reload to reflect tab change
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('tab', tab)
    window.history.pushState({}, '', newUrl)
  }

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

        {pageLoading && (
          <p className={styles.loading}>구성원 정보를 불러오는 중입니다...</p>
        )}
        {!pageLoading && error && (
          <p className={styles.error}>
            구성원 정보를 불러오지 못했습니다. 다시 시도해 주세요.
          </p>
        )}
        {!pageLoading && !error && !member && (
          <p className={styles.empty}>구성원을 찾을 수 없습니다.</p>
        )}

        {!pageLoading && member && (
          <>
            <MemberProfileCard member={member} />

            <div className={styles.tabContainer}>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'medications' ? styles.active : ''}`}
                  onClick={() => handleTabChange('medications')}
                >
                  약 목록
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'medication-logs' ? styles.active : ''}`}
                  onClick={() => handleTabChange('medication-logs')}
                >
                  복약 기록
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
                  onClick={() => handleTabChange('logs')}
                >
                  식단 기록
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'detail' ? styles.active : ''}`}
                  onClick={() => handleTabChange('detail')}
                >
                  상세 정보
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'medications' && (
                  <FamilyMedicationList medications={medications} />
                )}
                {activeTab === 'medication-logs' && (
                  <MedicationLogsTab userId={Number(member.userId)} />
                )}
                {activeTab === 'logs' && (
                  <DietLogsTab userId={Number(member.userId)} />
                )}
                {activeTab === 'detail' && (
                  <MedicationDetailTab userId={member.userId} medications={medications} />
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

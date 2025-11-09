import { useNavigate } from 'react-router-dom'
import MainLayout from '@/shared/components/layout/MainLayout'
import { FamilyGroupCard } from '../components/FamilyGroupCard.jsx'
import { FamilyMemberList } from '../components/FamilyMemberList.jsx'
import { useFamilySync } from '../hooks/useFamilySync'
import styles from './FamilyManagement.module.scss'

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  const {
    familyGroup,
    members,
    loading,
    removeMember,
    error,
    isSyncing,
    lastSyncTime,
  } = useFamilySync()

  const handleDetail = (memberId) => {
    navigate(`/family/member/${memberId}`)
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>가족 관리</h1>
          <button
            type="button"
            className={styles.inviteButton}
            onClick={() => navigate('/family/invite')}
          >
            + 가족 초대
          </button>
        </header>

        {loading ? (
          <p className={styles.loading}>가족 정보를 불러오는 중입니다...</p>
        ) : error ? (
          <p className={styles.error}>가족 정보를 불러오지 못했습니다: {error.message}</p>
        ) : (
          <>
            <div className={styles.syncMeta}>
              <span>{isSyncing ? '동기화 중...' : '동기화 완료'}</span>
              {lastSyncTime && (
                <span className={styles.syncTime}>
                  마지막 동기화: {lastSyncTime.toLocaleTimeString('ko-KR')}
                </span>
              )}
            </div>
            <FamilyGroupCard group={familyGroup} memberCount={members.length} />
            <FamilyMemberList
              members={members}
              onDetail={handleDetail}
              onRemove={removeMember}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyManagementPage

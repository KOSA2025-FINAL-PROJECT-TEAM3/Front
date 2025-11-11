import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import { FamilyGroupCard } from '../components/FamilyGroupCard.jsx'
import { FamilyMemberList } from '../components/FamilyMemberList.jsx'
import { useFamilySync } from '../hooks/useFamilySync'
import styles from './FamilyManagement.module.scss'

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const {
    familyGroup,
    members,
    loading,
    removeMember,
    error,
    isSyncing,
    lastSyncTime,
    onlineUsers,
    connectionStatus,
    onlineMemberIds,
    syncEvents,
  } = useFamilySync()

  const handleDetail = (memberId) => {
    navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
  }

  const handleRemoveMember = async (memberId) => {
    if (!memberId) return
    const target = members.find((member) => member.id === memberId)
    const confirmationMessage = target
      ? `${target.name}님을 가족 목록에서 제거하시겠어요?`
      : '이 구성원을 제거하시겠어요?'
    if (!window.confirm(confirmationMessage)) return
    setRemovingMemberId(memberId)
    try {
      await removeMember(memberId)
    } catch (error) {
      alert('구성원 제거에 실패했습니다. 다시 시도해 주세요.')
      console.warn('[FamilyManagement] removeMember failed', error)
    } finally {
      setRemovingMemberId(null)
    }
  }

  return (
    <MainLayout>
      <div className={styles.page} role="region" aria-busy={loading}>
        <header className={styles.header}>
          <h1>가족 관리</h1>
          <button
            type="button"
            className={styles.inviteButton}
            onClick={() => navigate(ROUTE_PATHS.familyInvite)}
          >
            + 가족 초대
          </button>
        </header>

        {loading ? (
          <p className={styles.loading} role="status" aria-live="polite">
            가족 정보를 불러오는 중입니다...
          </p>
        ) : error ? (
          <p className={styles.error} role="alert">
            가족 정보를 불러오지 못했습니다. {error.message}
          </p>
        ) : (
          <>
            <div className={styles.syncMeta}>
              <span className={styles.statusBadge} data-state={connectionStatus}>
                {connectionStatus === 'connected' && (isSyncing ? '동기화 중...' : '실시간 연결')}
                {connectionStatus === 'connecting' && '연결 중...'}
                {connectionStatus === 'waiting' && '대기'}
                {connectionStatus === 'disabled' && '실시간 비활성화'}
              </span>
              {lastSyncTime && (
                <span className={styles.syncTime}>
                  마지막 동기화 {lastSyncTime.toLocaleTimeString('ko-KR')}
                </span>
              )}
              {onlineUsers?.length > 0 && (
                <span className={styles.onlineCount}>
                  현재 접속 {onlineUsers.length}명
                </span>
              )}
            </div>
            {syncEvents?.length > 0 && (
              <ul className={styles.syncTimeline} role="log" aria-live="polite">
                {syncEvents.map((event) => (
                  <li key={event.id}>
                    <span className={styles.timelineTime}>
                      {event.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={styles.timelineLabel}>
                      {event.type === 'status' && `상태: ${event.status}`}
                      {event.type === 'members' && `구성원 ${event.count}명 동기화`}
                      {!['status', 'members'].includes(event.type) && '변경 사항 수신'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <FamilyGroupCard group={familyGroup} memberCount={members.length} />
            <FamilyMemberList
              members={members}
              onDetail={handleDetail}
              onRemove={handleRemoveMember}
              onlineMemberIds={onlineMemberIds}
              removingMemberId={removingMemberId}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyManagementPage

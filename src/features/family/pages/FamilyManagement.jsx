import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { useAuthStore } from '@features/auth/store/authStore'
import { FamilyGroupCard } from '../components/FamilyGroupCard.jsx'
import { FamilyMemberList } from '../components/FamilyMemberList.jsx'
import { useFamilySync } from '../hooks/useFamilySync'
import styles from './FamilyManagement.module.scss'

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [dissolving, setDissolving] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
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
    refetchFamily,
  } = useFamilySync()

  // 페이지 로드 시 최신 가족 데이터를 불러옴
  useEffect(() => {
    refetchFamily?.().catch((error) => {
      console.warn('[FamilyManagement] Initial refetch failed:', error)
    })
  }, [refetchFamily])

  const handleDetail = (memberId) => {
    navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
  }

  const handleDissolveGroup = () => {
    if (!familyGroup?.id) {
      toast.error('해산할 그룹이 없습니다.')
      return
    }
    if (familyGroup?.createdBy?.toString?.() !== currentUserId?.toString?.()) {
      toast.error('그룹 오너만 해산할 수 있습니다.')
      return
    }
    setConfirmModal({
      type: 'dissolve',
      title: '그룹 해산',
      message: '그룹을 해산하면 모든 구성원이 제거됩니다. 진행하시겠어요?',
    })
  }

  const handleRemoveMember = (memberId) => {
    if (!memberId) return
    const target = members.find((member) => member.id === memberId)
    const message = target
      ? `${target.name}님을 가족 목록에서 제거하시겠어요?`
      : '이 구성원을 제거하시겠어요?'

    setConfirmModal({
      type: 'remove',
      title: '구성원 제거',
      message,
      memberId,
    })
  }

  return (
    <MainLayout>
      {confirmModal && (
        <Modal
          isOpen={true}
          title={confirmModal.title}
          onClose={confirmModal.onCancel}
          footer={
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setConfirmModal(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={async () => {
                  if (confirmModal.type === 'remove') {
                    const memberId = confirmModal.memberId
                    setRemovingMemberId(memberId)
                    try {
                      await removeMember(memberId)
                      toast.success('구성원이 제거되었습니다.')
                    } catch (error) {
                      toast.error('구성원 제거에 실패했습니다. 다시 시도해 주세요.')
                      console.warn('[FamilyManagement] removeMember failed', error)
                    } finally {
                      setRemovingMemberId(null)
                      setConfirmModal(null)
                    }
                  } else if (confirmModal.type === 'dissolve') {
                    setDissolving(true)
                    try {
                      await familyApiClient.deleteGroup(familyGroup.id)
                      toast.success('그룹이 해산되었습니다.')
                      await refetchFamily?.()
                    } catch (error) {
                      toast.error('그룹 해산에 실패했습니다. 다시 시도해 주세요.')
                      console.warn('[FamilyManagement] dissolve failed', error)
                    } finally {
                      setDissolving(false)
                      setConfirmModal(null)
                    }
                  }
                }}
                disabled={removingMemberId || dissolving}
              >
                {removingMemberId || dissolving ? '진행 중...' : '확인'}
              </button>
            </div>
          }
        >
          <p>{confirmModal.message}</p>
        </Modal>
      )}
      <div className={styles.page} role="region" aria-busy={loading}>
        <header className={styles.header}>
          <h1>가족 관리</h1>
          <div>
            <button
              type="button"
              className={styles.inviteButton}
              onClick={() => navigate(ROUTE_PATHS.familyInvite)}
            >
              + 가족 초대
            </button>
            {familyGroup?.id &&
              familyGroup?.createdBy?.toString?.() === currentUserId?.toString?.() && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDissolveGroup}
                  style={{ marginLeft: 8 }}
                  disabled={dissolving}
                >
                  {dissolving ? '해산 중...' : '그룹 해산'}
                </button>
              )}
            <button
              type="button"
              className={styles.inviteButton}
              onClick={() => {
                if (familyGroup?.id) {
                  const path = ROUTE_PATHS.familyChatByGroup.replace(':familyGroupId', String(familyGroup.id))
                  navigate(path)
                } else {
                  navigate(ROUTE_PATHS.familyChat)
                }
              }}
              style={{ marginLeft: 8 }}
            >
              가족 채팅
            </button>
          </div>
        </header>

        {loading ? (
          <p className={styles.loading} role="status" aria-live="polite">
            가족 정보를 불러오는 중입니다...
          </p>
        ) : error ? (
          <div className={styles.error} role="alert">
            <p>
              가족 정보를 불러오지 못했습니다. {error?.message || ''}
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                onClick={async () => {
                  setRetrying(true)
                  try {
                    await refetchFamily()
                    toast.success('가족 정보를 다시 불러왔습니다.')
                  } catch (refetchError) {
                    toast.error('가족 정보 불러오기에 실패했습니다.')
                    console.warn('[FamilyManagement] refetchFamily failed', refetchError)
                  } finally {
                    setRetrying(false)
                  }
                }}
                disabled={retrying}
              >
                {retrying ? '다시 시도 중...' : '다시 시도'}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTE_PATHS.login)}
              >
                로그인으로 이동
              </button>
            </div>
          </div>
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
              currentUserId={currentUserId}
              groupOwnerId={familyGroup?.createdBy}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyManagementPage

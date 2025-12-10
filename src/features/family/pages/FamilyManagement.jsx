import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { useAuthStore } from '@features/auth/store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { FamilyGroupCard } from '../components/FamilyGroupCard.jsx'
import { FamilyMemberList } from '../components/FamilyMemberList.jsx'
import { GroupSelectionModal } from '../components/GroupSelectionModal.jsx'
import OwnerDelegationModal from '../components/OwnerDelegationModal.jsx'
import styles from './FamilyManagement.module.scss'
import logger from '@core/utils/logger'

// [2025-12-08] 가족 그룹 만들기 기능을 FamilyInvite에서 이동

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  // [Fixed] Resolve user ID from either id or userId to handle different auth response structures
  const currentUserId = useAuthStore((state) => state.user?.id || state.user?.userId)
  
  const {
    familyGroups,
    selectedGroupId,
    getSelectedGroup,
    createFamilyGroup,
    removeMember,
    updateMemberRole,
    loading,
    error,
    fetchFamily: refetchFamily
  } = useFamilyStore()

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showGroupCreateModal, setShowGroupCreateModal] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [roleChangingMemberId, setRoleChangingMemberId] = useState(null)
  const [dissolving, setDissolving] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
  const [delegationModal, setDelegationModal] = useState({ open: false, memberId: null, newRole: null })

  // 선택된 그룹 및 멤버 파생
  const familyGroup = getSelectedGroup()
  const members = familyGroup?.members || []

  // 페이지 로드 시 최신 가족 데이터를 불러옴
  useEffect(() => {
    refetchFamily?.().catch((error) => {
      logger.warn('[FamilyManagement] Initial refetch failed:', error)
    })
  }, [refetchFamily])

  // 그룹이 여러 개면 선택 모달 표시
  useEffect(() => {
    if (familyGroups.length > 1 && !selectedGroupId) {
      setShowGroupModal(true)
    }
  }, [familyGroups, selectedGroupId])

  const handleDetail = (memberId) => {
    navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
  }

  const handleDissolveGroup = () => {
    if (!familyGroup?.id) {
      toast.error('해산할 그룹이 없습니다.')
      return
    }
    if (familyGroup?.ownerId?.toString?.() !== currentUserId?.toString?.()) {
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

  const handleRoleChange = async (memberId, newRole, newOwnerMemberId = null) => {
    if (!memberId || !newRole) return
    setRoleChangingMemberId(memberId)
    try {
      await updateMemberRole(memberId, newRole, newOwnerMemberId)
      toast.success('역할이 변경되었습니다.')
      setDelegationModal({ open: false, memberId: null, newRole: null })
      await refetchFamily?.()
    } catch (error) {
      logger.warn('[FamilyManagement] Role change failed', error)
      const errorCode = error?.response?.data?.code
      const message = error?.response?.data?.message || error?.message || '역할 변경에 실패했습니다.'
      // OWNER_DELEGATION_REQUIRED: 소유자 양도 필요
      // 백엔드 메시지: "그룹 소유자가 역할을 전환하려면 새 소유자를 지정해야 합니다."
      if (errorCode === 'FAMILY_009' || message.includes('소유자') && message.includes('새 소유자')) {
        // 소유자 양도 모달을 표시 - 에러 토스트 표시하지 않음
        setDelegationModal({ open: true, memberId, newRole })
        // refetchFamily를 호출하지 않음 - 모달 확인/취소 시 처리
        setRoleChangingMemberId(null)
        return // finally를 건너뛰고 여기서 종료
      } else {
        toast.error(message)
      }
    } finally {
      setRoleChangingMemberId(null)
    }
  }

  const handleDelegationConfirm = async (newOwnerMemberId) => {
    const { memberId, newRole } = delegationModal
    if (!memberId || !newRole || !newOwnerMemberId) return
    await handleRoleChange(memberId, newRole, newOwnerMemberId)
  }

  return (
    <MainLayout>
      {/* 그룹 선택 모달 */}
      {showGroupModal && (
        <GroupSelectionModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onSelect={(groupId) => {
            logger.debug('[FamilyManagement] Group selected:', groupId)
            toast.success('그룹이 선택되었습니다.')
          }}
        />
      )}

      {/* 소유자 양도 모달 */}
      <OwnerDelegationModal
        isOpen={delegationModal.open}
        onClose={() => setDelegationModal({ open: false, memberId: null, newRole: null })}
        onConfirm={handleDelegationConfirm}
        members={members}
        currentOwnerId={familyGroup?.ownerId}
        isLoading={roleChangingMemberId !== null}
      />

      {/* 그룹 생성 모달 */}
      {showGroupCreateModal && (
        <Modal
          isOpen={true}
          title="가족 그룹 만들기"
          onClose={() => {
            setShowGroupCreateModal(false)
            setGroupName('')
          }}
          footer={
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowGroupCreateModal(false)
                  setGroupName('')
                }}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.inviteButton}
                onClick={async () => {
                  const trimmedName = groupName.trim()
                  if (!trimmedName) {
                    toast.warning('그룹 이름을 입력해주세요.')
                    return
                  }
                  setCreatingGroup(true)
                  try {
                    const group = await createFamilyGroup(trimmedName)
                    toast.success(`가족 그룹이 생성되었습니다: ${group?.name || trimmedName}`)
                    setGroupName('')
                    setShowGroupCreateModal(false)
                    await refetchFamily?.()
                  } catch (error) {
                    logger.warn('[FamilyManagement] createGroup failed', error)
                    const message =
                      error?.response?.data?.message ||
                      error?.message ||
                      '가족 그룹 생성에 실패했습니다. 다시 시도해주세요.'
                    toast.error(message)
                  } finally {
                    setCreatingGroup(false)
                  }
                }}
                disabled={creatingGroup}
              >
                {creatingGroup ? '생성 중...' : '그룹 생성'}
              </button>
            </div>
          }
        >
          <div className={styles.groupCreateModalContent}>
            <p className={styles.helper}>가족 그룹을 만들어 가족을 초대하고 관리하세요.</p>
            <input
              type="text"
              value={groupName}
              placeholder="예) 우리 가족"
              onChange={(e) => setGroupName(e.target.value)}
              disabled={creatingGroup}
              className={styles.groupNameInput}
            />
          </div>
        </Modal>
      )}

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
                      await refetchFamily?.() // Add this line to refetch family data

                    } catch (error) {
                      toast.error('구성원 제거에 실패했습니다. 다시 시도해 주세요.')
                      logger.warn('[FamilyManagement] removeMember failed', error)
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
                      logger.warn('[FamilyManagement] dissolve failed', error)
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
          {familyGroups.length > 1 && (
            <button
              type="button"
              className={styles.groupSelectButton}
              onClick={() => setShowGroupModal(true)}
              style={{ marginRight: 'auto' }}
            >
              그룹 변경 ({familyGroups.findIndex((g) => g.id === selectedGroupId) + 1}/{familyGroups.length})
            </button>
          )}
          <div>
            {/* 그룹 생성 버튼 - 항상 표시 (사용자는 0개 이상의 그룹 보유 가능) */}
            <button
              type="button"
              className={styles.inviteButton}
              onClick={() => setShowGroupCreateModal(true)}
            >
              + 그룹 생성
            </button>
            <button
              type="button"
              className={styles.inviteButton}
              onClick={() => navigate(ROUTE_PATHS.familyInvite)}
              style={{ marginLeft: 8 }}
            >
              + 가족 초대
            </button>
            {familyGroup?.id &&
              familyGroup?.ownerId?.toString?.() === currentUserId?.toString?.() && (
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
                    logger.warn('[FamilyManagement] refetchFamily failed', refetchError)
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
            <FamilyGroupCard group={familyGroup} memberCount={members.length} />
            <FamilyMemberList
              members={members}
              onDetail={handleDetail}
              onRemove={handleRemoveMember}
              onRoleChange={handleRoleChange}
              removingMemberId={removingMemberId}
              roleChangingMemberId={roleChangingMemberId}
              currentUserId={currentUserId}
              groupOwnerId={familyGroup?.ownerId}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyManagementPage
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
import { useFamilySync } from '../hooks/useFamilySync'
import styles from './FamilyManagement.module.scss'

// [2025-12-08] 가족 그룹 만들기 기능을 FamilyInvite에서 이동

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  // [Fixed] Resolve user ID from either id or userId to handle different auth response structures
  const currentUserId = useAuthStore((state) => state.user?.id || state.user?.userId)
  const familyGroups = useFamilyStore((state) => state.familyGroups)
  const selectedGroupId = useFamilyStore((state) => state.selectedGroupId)
  const getSelectedGroup = useFamilyStore((state) => state.getSelectedGroup)
  const createFamilyGroup = useFamilyStore((state) => state.createFamilyGroup)

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showGroupCreateModal, setShowGroupCreateModal] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [dissolving, setDissolving] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
  const {
    familyGroup,
    members,
    loading,
    removeMember,
    error,
    onlineMemberIds,
    refetchFamily,
  } = useFamilySync()

  // 페이지 로드 시 최신 가족 데이터를 불러옴
  useEffect(() => {
    refetchFamily?.().catch((error) => {
      console.warn('[FamilyManagement] Initial refetch failed:', error)
    })
  }, [refetchFamily])

  // 그룹이 여러 개면 선택 모달 표시
  useEffect(() => {
    if (familyGroups.length > 1 && !selectedGroupId) {
      setShowGroupModal(true)
    }
  }, [familyGroups, selectedGroupId])

  // 선택된 그룹의 members 가져오기
  const selectedGroup = getSelectedGroup()
  const selectedMembers = selectedGroup?.members || members

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
      {/* 그룹 선택 모달 */}
      {showGroupModal && (
        <GroupSelectionModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onSelect={(groupId) => {
            console.log('[FamilyManagement] Group selected:', groupId)
            toast.success('그룹이 선택되었습니다.')
          }}
        />
      )}

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
                    console.warn('[FamilyManagement] createGroup failed', error)
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
            <FamilyGroupCard group={selectedGroup || familyGroup} memberCount={selectedMembers.length} />
            <FamilyMemberList
              members={selectedMembers}
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

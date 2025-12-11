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

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  // [Fixed] Resolve user ID from either id or userId to handle different auth response structures
  const currentUserId = useAuthStore((state) => state.user?.id || state.user?.userId)
  const familyGroups = useFamilyStore((state) => state.familyGroups)
  const selectedGroupId = useFamilyStore((state) => state.selectedGroupId)
  const getSelectedGroup = useFamilyStore((state) => state.getSelectedGroup)
  const [currentUserRole, setCurrentUserRole] = useState(null)

  const [showGroupModal, setShowGroupModal] = useState(false)
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

  useEffect(() => {
    if (!selectedMembers?.length || !currentUserId) {
      setCurrentUserRole(null)
      return
    }
    const me = selectedMembers.find((m) => m.userId?.toString?.() === currentUserId?.toString?.())
    setCurrentUserRole(me?.role || null)
  }, [selectedMembers, currentUserId])

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

  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [notificationSettings, setNotificationSettings] = useState({
    kakaoEnabled: true,
    dietWarningEnabled: true,
    medicationMissedEnabled: true,
  })
  const [notificationLoading, setNotificationLoading] = useState(false)

  const handleOpenNotificationSettings = async (memberId) => {
    if (!familyGroup?.id || !memberId) return
    setSelectedMemberId(memberId)
    setShowNotificationModal(true)
    setNotificationLoading(true)
    try {
      const settings = await familyApiClient.getMemberNotificationSettings(familyGroup.id, memberId)
      if (settings) {
        setNotificationSettings((prev) => ({
          ...prev,
          kakaoEnabled: settings.kakaoEnabled ?? prev.kakaoEnabled,
          dietWarningEnabled: settings.dietWarningEnabled ?? prev.dietWarningEnabled,
          medicationMissedEnabled: settings.medicationMissedEnabled ?? prev.medicationMissedEnabled,
        }))
      }
    } catch (e) {
      console.warn('가족 구성원 알림 설정 로드 실패', e)
      toast.error('알림 설정을 불러오지 못했습니다.')
    } finally {
      setNotificationLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    if (!familyGroup?.id || !selectedMemberId) return
    setNotificationLoading(true)
    try {
      await familyApiClient.updateMemberNotificationSettings(familyGroup.id, selectedMemberId, {
        familyGroupId: familyGroup.id,
        targetUserId: selectedMemberId,
        ...notificationSettings,
      })
      toast.success('알림 설정이 저장되었습니다.')
      setShowNotificationModal(false)
      setSelectedMemberId(null)
    } catch (e) {
      console.error('가족 구성원 알림 설정 저장 실패', e)
      toast.error('알림 설정 저장에 실패했습니다.')
    } finally {
      setNotificationLoading(false)
    }
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
        {/* 알림 설정 모달 */}
        {showNotificationModal && (
          <Modal
            isOpen={showNotificationModal}
            title="가족 알림 설정"
            onClose={() => setShowNotificationModal(false)}
            footer={
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowNotificationModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleSaveNotificationSettings}
                  disabled={notificationLoading}
                >
                  {notificationLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            }
          >
            <div className={styles.notificationSettings}>
              <p className={styles.description}>
                이 가족 그룹에서 발생하는 알림을 카카오톡이나 앱 알림으로 받을지 설정합니다.
              </p>
              <div className={styles.channelList}>
                <h3>채널</h3>
                <label className={styles.settingItem}>
                  <span>카카오톡 알림</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.kakaoEnabled}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({ ...prev, kakaoEnabled: e.target.checked }))
                    }
                  />
                </label>
              </div>
              <div className={styles.channelList}>
                <h3>알림 종류</h3>
                <label className={styles.settingItem}>
                  <span>식단 경고 알림</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dietWarningEnabled}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        dietWarningEnabled: e.target.checked,
                      }))
                    }
                  />
                </label>
                <label className={styles.settingItem}>
                  <span>미복용 알림</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.medicationMissedEnabled}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        medicationMissedEnabled: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </Modal>
        )}

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
            <FamilyGroupCard group={selectedGroup || familyGroup} memberCount={selectedMembers.length} />
            <FamilyMemberList
              members={selectedMembers}
              onDetail={handleDetail}
              onRemove={handleRemoveMember}
              onSettings={handleOpenNotificationSettings}
              onlineMemberIds={onlineMemberIds}
              removingMemberId={removingMemberId}
              currentUserId={currentUserId}
              groupOwnerId={familyGroup?.createdBy}
              canManageNotifications={currentUserRole === 'CAREGIVER'}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default FamilyManagementPage

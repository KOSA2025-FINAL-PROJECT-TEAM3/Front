import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import AppDialog from '@shared/components/mui/AppDialog'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { Alert, Badge, Box, Button, Chip, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from '@mui/material'
import { toast } from '@shared/components/toast/toastStore'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { useAuthStore } from '@features/auth/store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { shallow } from 'zustand/shallow'
import { FamilyGroupCard } from '../components/FamilyGroupCard.jsx'
import { FamilyMemberList } from '../components/FamilyMemberList.jsx'
import { GroupSelectionModal } from '../components/GroupSelectionModal.jsx'
import OwnerDelegationModal from '../components/OwnerDelegationModal.jsx'
import logger from '@core/utils/logger'
import { useUnreadBadge } from '@features/chat/hooks/useUnreadBadge'
import { BackButton } from '@shared/components/mui/BackButton'

// [2025-12-08] 가족 그룹 만들기 기능을 FamilyInvite에서 이동

export const FamilyManagementPage = () => {
  const navigate = useNavigate()
  // [Fixed] Resolve user ID from either id or userId to handle different auth response structures
  const currentUserId = useAuthStore((state) => state.user?.id || state.user?.userId)

  // shallow 비교로 불필요한 리렌더링 방지
  const {
    familyGroups,
    selectedGroupId,
    getSelectedGroup,
    createFamilyGroup,
    removeMember,
    updateMemberRole,
    deleteGroup,
    loading,
    error,
    refetchFamily,
  } = useFamilyStore(
    (state) => ({
      familyGroups: state.familyGroups,
      selectedGroupId: state.selectedGroupId,
      getSelectedGroup: state.getSelectedGroup,
      createFamilyGroup: state.createFamilyGroup,
      removeMember: state.removeMember,
      updateMemberRole: state.updateMemberRole,
      deleteGroup: state.deleteGroup,
      loading: state.loading,
      error: state.error,
      refetchFamily: state.refetchFamily,
    }),
    shallow
  )

  // 선택된 그룹 및 멤버 파생
  const familyGroup = getSelectedGroup()
  const members = useMemo(() => familyGroup?.members ?? [], [familyGroup])

  const { unreadCount } = useUnreadBadge(familyGroup?.id)

  const [currentUserRole, setCurrentUserRole] = useState(null)
  const onlineMemberIds = []

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

  useEffect(() => {
    if (!members?.length || !currentUserId) {
      setCurrentUserRole(null)
      return
    }
    const me = members.find((m) => m.userId?.toString?.() === currentUserId?.toString?.())
    setCurrentUserRole(me?.role || null)
  }, [members, currentUserId])

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
      logger.warn('가족 구성원 알림 설정 로드 실패', e)
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
    const isSelf =
      Boolean(target?.userId) &&
      Boolean(currentUserId) &&
      String(target.userId) === String(currentUserId)

    const title = isSelf ? '가족 탈퇴' : '구성원 제거'
    const message = isSelf
      ? '현재 가족 그룹에서 탈퇴하시겠어요?'
      : target
        ? `${target.name}님을 가족 목록에서 제거하시겠어요?`
        : '이 구성원을 제거하시겠어요?'

    setConfirmModal({
      type: 'remove',
      title,
      message,
      memberId,
      isSelf,
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
        <AppDialog
          isOpen={true}
          title="가족 그룹 만들기"
          onClose={() => {
            setShowGroupCreateModal(false)
            setGroupName('')
          }}
          footer={
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setShowGroupCreateModal(false)
                  setGroupName('')
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="contained"
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
              </Button>
            </Stack>
          }
        >
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              가족 그룹을 만들어 가족을 초대하고 관리하세요.
            </Typography>
            <TextField
              value={groupName}
              placeholder="예) 우리 가족"
              onChange={(e) => setGroupName(e.target.value)}
              disabled={creatingGroup}
              autoFocus
              fullWidth
            />
          </Stack>
        </AppDialog>
      )}

      {confirmModal && (
        <AppDialog
          isOpen={true}
          title={confirmModal.title}
          onClose={() => setConfirmModal(null)}
          footer={
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => setConfirmModal(null)}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="contained"
                color="error"
                onClick={async () => {
                  if (confirmModal.type === 'remove') {
                    const memberId = confirmModal.memberId
                    setRemovingMemberId(memberId)
                    try {
                      await removeMember(memberId)
                      toast.success(confirmModal.isSelf ? '가족에서 탈퇴했습니다.' : '구성원이 제거되었습니다.')
                      await refetchFamily?.() // Add this line to refetch family data

                    } catch (error) {
                      toast.error(
                        confirmModal.isSelf
                          ? '가족 탈퇴에 실패했습니다. 다시 시도해 주세요.'
                          : '구성원 제거에 실패했습니다. 다시 시도해 주세요.',
                      )
                      logger.warn('[FamilyManagement] removeMember failed', error)
                    } finally {
                      setRemovingMemberId(null)
                      setConfirmModal(null)
                    }
                  } else if (confirmModal.type === 'dissolve') {
                    setDissolving(true)
                    try {
                      await deleteGroup(familyGroup.id)
                      toast.success('그룹이 해산되었습니다.')
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
              </Button>
            </Stack>
          }
        >
          <Typography variant="body2">{confirmModal.message}</Typography>
        </AppDialog>
      )}
      <PageStack role="region" aria-busy={loading}>
        {/* 알림 설정 모달 */}
        {showNotificationModal && (
          <AppDialog
            isOpen={showNotificationModal}
            title="가족 알림 설정"
            onClose={() => setShowNotificationModal(false)}
            footer={
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowNotificationModal(false)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleSaveNotificationSettings}
                  disabled={notificationLoading}
                >
                  {notificationLoading ? '저장 중...' : '저장'}
                </Button>
              </Stack>
            }
          >
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                이 가족 그룹에서 발생하는 알림을 카카오톡이나 앱 알림으로 받을지 설정합니다.
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    채널
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.kakaoEnabled}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({ ...prev, kakaoEnabled: e.target.checked }))
                        }
                      />
                    }
                    label="카카오톡 알림"
                  />
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    알림 종류
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.dietWarningEnabled}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            dietWarningEnabled: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="식단 경고 알림"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.medicationMissedEnabled}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            medicationMissedEnabled: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="미복용 알림"
                  />
                </Stack>
              </Paper>
            </Stack>
          </AppDialog>
        )}

        <PageHeader
          leading={<BackButton />}
          title="가족 관리"
          subtitle={
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {familyGroup?.name ? (
                <Chip size="small" color="primary" label={familyGroup.name} />
              ) : (
                <Chip size="small" variant="outlined" label="그룹 없음" />
              )}
              {familyGroups.length > 1 ? (
                <Button type="button" variant="outlined" onClick={() => setShowGroupModal(true)} sx={{ fontWeight: 900 }}>
                  그룹 변경 ({familyGroups.findIndex((g) => g.id === selectedGroupId) + 1}/{familyGroups.length})
                </Button>
              ) : null}
            </Stack>
          }
          right={
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.5, md: 1 },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              '& .MuiButton-root': {
                fontSize: { xs: 11, md: 14 },
                px: { xs: 1, md: 2 },
                py: { xs: 0.5, md: 0.75 },
                minWidth: { xs: 'auto', md: 64 }
              }
            }}>
              <Button type="button" variant="outlined" onClick={() => setShowGroupCreateModal(true)} sx={{ fontWeight: 900 }}>
                + 그룹 생성
              </Button>
              <Button type="button" variant="contained" onClick={() => navigate(ROUTE_PATHS.familyInvite)} sx={{ fontWeight: 900 }}>
                + 가족 초대
              </Button>
              {familyGroup?.id && familyGroup?.ownerId?.toString?.() === currentUserId?.toString?.() ? (
                <Button type="button" color="error" variant="outlined" onClick={handleDissolveGroup} disabled={dissolving}>
                  {dissolving ? '해산 중...' : '그룹 해산'}
                </Button>
              ) : null}
              <Badge
                color="error"
                overlap="circular"
                badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                invisible={!unreadCount}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    if (familyGroup?.id) {
                      const path = ROUTE_PATHS.familyChatByGroup.replace(':familyGroupId', String(familyGroup.id))
                      navigate(path)
                    } else {
                      navigate(ROUTE_PATHS.familyChat)
                    }
                  }}
                >
                  가족 채팅
                </Button>
              </Badge>
            </Box>
          }
        />

        {loading ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
              가족 정보를 불러오는 중입니다...
            </Typography>
          </Paper>
        ) : error ? (
          <Alert
            severity="error"
            role="alert"
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  type="button"
                  color="inherit"
                  size="small"
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
                </Button>
                <Button type="button" color="inherit" size="small" onClick={() => navigate(ROUTE_PATHS.login)}>
                  로그인으로 이동
                </Button>
              </Stack>
            }
          >
            가족 정보를 불러오지 못했습니다. {error?.message || ''}
          </Alert>
        ) : (
          <>
            <FamilyGroupCard group={familyGroup} memberCount={members.length} />
            <FamilyMemberList
              members={members}
              onDetail={handleDetail}
              onRemove={handleRemoveMember}
              onSettings={handleOpenNotificationSettings}
              onRoleChange={handleRoleChange}
              onlineMemberIds={onlineMemberIds}
              removingMemberId={removingMemberId}
              roleChangingMemberId={roleChangingMemberId}
              currentUserId={currentUserId}
              groupOwnerId={familyGroup?.ownerId}
              canManageNotifications={currentUserRole === 'CAREGIVER'}
            />
          </>
        )}
      </PageStack>
    </MainLayout>
  )
}

export default FamilyManagementPage

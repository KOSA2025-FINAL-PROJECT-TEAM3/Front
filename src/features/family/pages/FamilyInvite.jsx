import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import AppDialog from '@shared/components/mui/AppDialog'
import { toast } from '@shared/components/toast/toastStore'
import InviteMemberForm from '../components/InviteMemberForm.jsx'
import { useFamily } from '../hooks/useFamily'
import logger from '@core/utils/logger'
import SelectedInviteDetails from '../components/SelectedInviteDetails.jsx' // Import new component
import envConfig from '@config/environment.config' // Import environment config

export const FamilyInvitePage = () => {
  const navigate = useNavigate()
  const {
    familyGroups,
    selectedGroupId,
    invites,
    inviteMember,
    loadInvites,
    cancelInvite,
    updateInvite, // Now used
    acceptInvite,
    initialized,
    initialize,
    refetchFamily,
  } = useFamily((state) => ({
    familyGroups: state.familyGroups,
    selectedGroupId: state.selectedGroupId,
    invites: state.invites,
    inviteMember: state.inviteMember,
    loadInvites: state.loadInvites,
    cancelInvite: state.cancelInvite,
    updateInvite: state.updateInvite, // Added
    acceptInvite: state.acceptInvite,
    initialized: state.initialized,
    initialize: state.initialize,
    refetchFamily: state.refetchFamily,
  }))

  const familyGroup = useMemo(() => {
    return familyGroups?.find((g) => g.id === selectedGroupId) || null
  }, [familyGroups, selectedGroupId])

  const [submitting, setSubmitting] = useState(false)
  const [latestInvite, setLatestInvite] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)
  const [updatingInviteId, setUpdatingInviteId] = useState(null)

  const sentInvites = useMemo(() => {
    return (invites?.sent || []).filter((inv) => inv.status === 'PENDING')
  }, [invites])
  const receivedInvites = useMemo(() => invites?.received || [], [invites])
  const hasGroup = Boolean(familyGroup?.id)

  useEffect(() => {
    if (!familyGroup) {
      logger.debug('[FamilyInvite] familyGroup이 없음, 강제 로드')
      initialize?.({ force: true }).catch((error) =>
        logger.warn('[FamilyInvite] initialize failed', error),
      )
    } else if (!initialized) {
      initialize?.().catch((error) =>
        logger.warn('[FamilyInvite] initialize failed', error),
      )
    }
    loadInvites?.().catch((error) =>
      logger.warn('[FamilyInvite] loadInvites failed', error),
    )
  }, [familyGroup, initialized, initialize, loadInvites])

  useEffect(() => {
    return () => {
      setLatestInvite(null)
      setSubmitting(false)
    }
  }, [])

  const handleSubmit = async (formData) => {
    if (!hasGroup) {
      toast.warning('먼저 가족 그룹을 생성해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const response = await inviteMember(formData)
      // The response already contains inviteUrl, shortCode, longToken
      // Ensure inviteUrl is properly set for SelectedInviteDetails if not present (using helper)
      const fullInvite = {
        ...response,
        id: response.id || response.shortCode, // Ensure ID
        inviteUrl: response.inviteUrl || inviteLinkGenerator(response),
        // [FIX] 백엔드 응답에 inviteeName이 없을 경우, 입력한 이름을 직접 주입 (Kakao 공유 시 사용)
        inviteeName: response.inviteeName || formData.name,
        // [FIX] 가족 그룹명도 주입 (Kakao 공유 시 사용)
        groupName: response.groupName || familyGroup?.name || '가족 그룹',
      }
      setLatestInvite(fullInvite)
      return response
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to generate invite link from response (if not directly provided)
  const inviteLinkGenerator = (inviteData) => {
    if (!inviteData) return ''
    const origin = envConfig.FRONTEND_URL
    if (inviteData.inviteUrl) return inviteData.inviteUrl
    if (inviteData.longToken) {
      return `${origin}${ROUTE_PATHS.inviteLanding}?token=${inviteData.longToken}`
    }
    if (inviteData.shortCode || inviteData.inviteCode) {
      const code = inviteData.shortCode || inviteData.inviteCode
      return `${origin}${ROUTE_PATHS.inviteCodeEntry}?code=${code}`
    }
    return ''
  }

  const handleCloseSelectedInvite = () => {
    setLatestInvite(null)
  }

  const handleCancel = async (inviteId) => {
    setCancelingId(inviteId)
    try {
      await cancelInvite?.(inviteId)
      toast.success('초대가 취소되었습니다.')
      setLatestInvite(null)
    } catch (error) {
      logger.warn('[FamilyInvite] cancelInvite failed', error)
      toast.error('초대를 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setCancelingId(null)
    }
  }

  const handleUpdateInviteRole = async (inviteId, newRole) => {
    setUpdatingInviteId(inviteId)
    try {
      await updateInvite(inviteId, { suggestedRole: newRole })
      toast.success('초대 역할이 수정되었습니다.')
      await loadInvites?.()
      setLatestInvite(prev => prev && prev.id === inviteId ? { ...prev, suggestedRole: newRole } : null)
    } catch (error) {
      logger.warn('[FamilyInvite] updateInviteRole failed', error)
      toast.error('초대 역할 수정에 실패했습니다.')
    } finally {
      setUpdatingInviteId(null)
    }
  }

  const handleAccept = async (invite) => {
    const code = invite?.shortCode || invite?.inviteCode
    if (!code) {
      toast.warning('초대 코드가 없습니다. 초대를 다시 요청해 주세요.')
      return
    }
    setAcceptingId(invite.id || code)
    try {
      await acceptInvite?.({ shortCode: code })
      await Promise.all([refetchFamily?.(), loadInvites?.()])
      toast.success('초대를 수락했습니다.')
    } catch (error) {
      logger.warn('[FamilyInvite] acceptInvite failed', error)
      const friendly =
        error?.response?.status === 400
          ? '초대 코드가 만료되었거나 잘못되었습니다.'
          : error?.response?.status === 401
            ? '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.'
            : error?.response?.status === 409
              ? '이미 가입된 가족 그룹입니다.'
              : '초대 수락에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      toast.error(friendly)
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <AppDialog
      isOpen={true}
      title="가족 초대"
      description={
        <>
          <span>소중한 가족을 초대하여 건강 관리를 함께 시작해보세요.</span>
          <span>초대 링크를 보내면 간편하게, 또는 코드를 직접 입력하여 참여할 수 있습니다.</span>
        </>
      }
      onClose={() => navigate(ROUTE_PATHS.family, { replace: true })}
      maxWidth="md"
    >
      <>
        {!hasGroup && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => navigate(ROUTE_PATHS.family)}>
                가족 관리로 이동
              </Button>
            }
          >
            가족 그룹이 없습니다. 가족 관리 페이지에서 그룹을 먼저 생성해주세요.
          </Alert>
        )}

        <InviteMemberForm onSubmit={handleSubmit} loading={submitting || !hasGroup} />

        {/* Selected Invite Details Section */}
        {latestInvite && (
          <SelectedInviteDetails
            invite={latestInvite}
            onClose={handleCloseSelectedInvite}
            onCancel={handleCancel}
            onRoleChange={handleUpdateInviteRole}
            cancelingId={cancelingId}
            updatingInviteId={updatingInviteId}
          />
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            보낸 초대
          </Typography>
          {sentInvites?.length ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {sentInvites.map((invite) => {
                const inviteId = invite.id || invite.shortCode || invite.inviteCode
                const selectedId =
                  latestInvite?.id || latestInvite?.shortCode || latestInvite?.inviteCode
                const isSelected = selectedId === inviteId

                return (
                  <Paper
                    key={inviteId}
                    variant="outlined"
                    onClick={() => setLatestInvite(invite)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.200' },
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {invite.inviteeName || '이름 없음'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invite.intendedForEmail || invite.inviteeEmail || '이메일 미지정'}
                          </Typography>
                        </Box>
                        <Button
                          type="button"
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancel(inviteId)
                          }}
                          disabled={cancelingId === inviteId}
                        >
                          {cancelingId === inviteId ? '취소 중...' : '취소'}
                        </Button>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          label={invite.suggestedRole || '역할 미정'}
                          color={invite.suggestedRole === 'CAREGIVER' ? 'success' : 'primary'}
                          variant="outlined"
                        />
                        {invite.expiresAt ? (
                          <Typography variant="caption" color="text.secondary">
                            만료 {new Date(invite.expiresAt).toLocaleString('ko-KR')}
                          </Typography>
                        ) : null}
                        {invite.status ? (
                          <Chip size="small" label={invite.status} color="warning" variant="outlined" />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              아직 보낸 초대가 없습니다.
            </Typography>
          )}
        </Box>

        {receivedInvites?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              받은 초대
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {receivedInvites.map((invite) => {
                const inviteId = invite.id || invite.shortCode || invite.inviteCode
                return (
                  <Paper key={inviteId} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {invite.inviterName || '보낸 사람 미상'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invite.groupName || '그룹 미상'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {invite.expiresAt ? (
                          <Typography variant="caption" color="text.secondary">
                            만료 {new Date(invite.expiresAt).toLocaleString('ko-KR')}
                          </Typography>
                        ) : null}
                        {invite.status ? (
                          <Chip size="small" label={invite.status} color="warning" variant="outlined" />
                        ) : null}
                      </Stack>

                      <Divider />

                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          type="button"
                          variant="contained"
                          onClick={() => handleAccept(invite)}
                          disabled={acceptingId === inviteId}
                        >
                          {acceptingId === inviteId ? '수락 중...' : '수락'}
                        </Button>
                        <Button
                          type="button"
                          color="error"
                          variant="outlined"
                          onClick={() => handleCancel(inviteId)}
                          disabled={cancelingId === inviteId}
                        >
                          {cancelingId === inviteId ? '거절 중...' : '거절'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          </Box>
        )}
      </>
    </AppDialog>
  )
}

export default FamilyInvitePage

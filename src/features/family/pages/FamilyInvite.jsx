import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
import InviteMemberForm from '../components/InviteMemberForm.jsx'
import { useFamily } from '../hooks/useFamily'
import styles from './FamilyInvite.module.scss'
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
    <Modal
      title="가족 초대"
      description={
        <>
          <span>소중한 가족을 초대하여 건강 관리를 함께 시작해보세요.</span>
          <span>초대 링크를 보내면 간편하게, 또는 코드를 직접 입력하여 참여할 수 있습니다.</span>
        </>
      }
      onClose={() => navigate(ROUTE_PATHS.family, { replace: true })}
    >
      <>
        {!hasGroup && (
          <div className={styles.alert}>
            <p>가족 그룹이 없습니다. 가족 관리 페이지에서 그룹을 먼저 생성해주세요.</p>
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.family)}
              style={{ marginTop: 8 }}
            >
              가족 관리로 이동
            </button>
          </div>
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

        <div className={styles.listSection}>
          <h3>보낸 초대</h3>
          {sentInvites?.length ? (
            <ul className={styles.inviteList}>
              {sentInvites.map((invite) => {
                const inviteId = invite.id || invite.shortCode || invite.inviteCode
                return (
                  <li
                    key={inviteId}
                    className={`${styles.inviteItem} ${latestInvite?.id === invite.id ? styles.selected : ''}`}
                    onClick={() => setLatestInvite(invite)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.inviteMeta}>
                      <span className={styles.name}>{invite.inviteeName || '이름 없음'}</span>
                      <span className={styles.email}>{invite.intendedForEmail || invite.inviteeEmail || '이메일 미지정'}</span>
                      <span className={styles.role}>{invite.suggestedRole || '역할 미정'}</span>
                      {invite.expiresAt && (
                        <span className={styles.expiry}>
                          만료 {new Date(invite.expiresAt).toLocaleString('ko-KR')}
                        </span>
                      )}
                      {invite.status && <span className={styles.status}>{invite.status}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancel(inviteId)
                      }}
                      disabled={cancelingId === inviteId}
                    >
                      {cancelingId === inviteId ? '취소 중...' : '취소'}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className={styles.helper}>아직 보낸 초대가 없습니다.</p>
          )}
        </div>

        {receivedInvites?.length > 0 && (
          <div className={styles.listSection}>
            <h3>받은 초대</h3>
            <ul className={styles.inviteList}>
              {receivedInvites.map((invite) => {
                const inviteId = invite.id || invite.shortCode || invite.inviteCode
                return (
                  <li key={inviteId}>
                    <div className={styles.inviteMeta}>
                      <span className={styles.email}>{invite.inviterName || '보낸 사람 미상'}</span>
                      <span className={styles.role}>{invite.groupName || '그룹 미상'}</span>
                      {invite.expiresAt && (
                        <span className={styles.expiry}>
                          만료 {new Date(invite.expiresAt).toLocaleString('ko-KR')}
                        </span>
                      )}
                      {invite.status && <span className={styles.status}>{invite.status}</span>}
                    </div>
                    <div className={styles.inviteActions}>
                      <button
                        type="button"
                        onClick={() => handleAccept(invite)}
                        disabled={acceptingId === inviteId}
                      >
                        {acceptingId === inviteId ? '수락 중...' : '수락'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(inviteId)}
                        disabled={cancelingId === inviteId}
                      >
                        {cancelingId === inviteId ? '거절 중...' : '거절'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </>
    </Modal>
  )
}

export default FamilyInvitePage
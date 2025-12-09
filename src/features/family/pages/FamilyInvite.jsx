import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
import InviteMemberForm from '../components/InviteMemberForm.jsx'
import { useFamily } from '../hooks/useFamily'
import styles from './FamilyInvite.module.scss'
import logger from '@core/utils/logger'

export const FamilyInvitePage = () => {
  const navigate = useNavigate()
  const {
    familyGroups, // Changed
    selectedGroupId, // Changed
    invites,
    inviteMember,
    loadInvites,
    cancelInvite,
    acceptInvite,
    initialized,
    initialize,
    refetchFamily,
  } = useFamily((state) => ({
    familyGroups: state.familyGroups, // Changed
    selectedGroupId: state.selectedGroupId, // Changed
    invites: state.invites,
    inviteMember: state.inviteMember,
    loadInvites: state.loadInvites,
    cancelInvite: state.cancelInvite,
    acceptInvite: state.acceptInvite,
    initialized: state.initialized,
    initialize: state.initialize,
    refetchFamily: state.refetchFamily,
    // [2025-12-08] createFamilyGroup과 loading 제거 (FamilyManagement로 이동)
  }))

  // [Fixed] Derive familyGroup from familyGroups and selectedGroupId
  const familyGroup = useMemo(() => {
    return familyGroups?.find((g) => g.id === selectedGroupId) || null
  }, [familyGroups, selectedGroupId])

  const [submitting, setSubmitting] = useState(false)
  const [latestInvite, setLatestInvite] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)


  const sentInvites = useMemo(() => {
    return (invites?.sent || []).filter((inv) => inv.status === 'PENDING')
  }, [invites])
  const receivedInvites = useMemo(() => invites?.received || [], [invites])
  const hasGroup = Boolean(familyGroup?.id)

  useEffect(() => {
    // familyGroup이 없으면 강제로 다시 로드
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
    // 컴포넌트 언마운트 시 상태 초기화
    return () => {
      setLatestInvite(null)
      setSubmitting(false)
    }
  }, [])

  const inviteLink = useMemo(() => {
    if (typeof window === 'undefined') return ''
    // 개발 환경에서는 명시적으로 localhost:5173 사용
    const origin = import.meta.env.DEV
      ? 'http://localhost:5173'
      : window.location.origin
    if (latestInvite?.longToken) {
      return `${origin}${ROUTE_PATHS.inviteAccept}?token=${latestInvite.longToken}`
    }
    if (latestInvite?.shortCode || latestInvite?.inviteCode) {
      const code = latestInvite.shortCode || latestInvite.inviteCode
      return `${origin}${ROUTE_PATHS.inviteAccept}?code=${code}`
    }
    return ''
  }, [latestInvite?.inviteCode, latestInvite?.longToken, latestInvite?.shortCode])

  const linkAvailable = Boolean(inviteLink)

  const handleSubmit = async (formData) => {
    if (!hasGroup) {
      toast.warning('먼저 가족 그룹을 생성해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const response = await inviteMember(formData)
      if (response?.inviteCode) {
        setLatestInvite(response)
      }
      return response
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setLatestInvite(null)
  }

  const handleCancel = async (inviteId) => {
    setCancelingId(inviteId)
    try {
      await cancelInvite?.(inviteId)
      toast.success('초대가 취소되었습니다.')
    } catch (error) {
      logger.warn('[FamilyInvite] cancelInvite failed', error)
      toast.error('초대를 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setCancelingId(null)
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
      await acceptInvite?.(code)
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

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('초대 링크가 복사되었습니다.')
    } catch (err) {
      logger.warn('초대 링크 복사 실패:', err)
      toast.error('복사에 실패했습니다. 직접 선택하여 복사해 주세요.')
    }
  }

  // [2025-12-08] 가족 그룹 만들기 기능은 FamilyManagement로 이동됨

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
      {/* 가족 그룹이 없는 경우 안내 메시지 */}
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

      <div className={styles.linkSection}>
        <label htmlFor="invite-link">초대 링크</label>
        <div className={styles.linkRow}>
          <input
            id="invite-link"
            type="text"
            value={inviteLink}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button type="button" onClick={handleCopy} disabled={!linkAvailable}>
            복사
          </button>
          <button type="button" onClick={handleClose} disabled={!latestInvite}>
            닫기
          </button>
        </div>
        {!linkAvailable && (
          <p className={styles.helper}>초대 발송 후 초대 링크가 표시됩니다. 먼저 초대를 발송해주세요.</p>
        )}
        <p className={styles.helper}>
          초대받은 분은 <a href={ROUTE_PATHS.inviteCodeEntry} style={{ color: '#2563eb' }}>초대 코드 입력 페이지</a>에서 코드를 직접 입력할 수 있습니다.
        </p>
        {latestInvite?.expiresAt && (
          <p className={styles.helper}>
            만료 시각: {new Date(latestInvite.expiresAt).toLocaleString('ko-KR')}
          </p>
        )}
        {latestInvite?.inviteeEmail && (
          <p className={styles.helper}>초대 대상: {latestInvite.inviteeEmail}</p>
        )}
        {latestInvite?.shortCode && (
          <div className={styles.shortCodeSection}>
            <p className={styles.helper}>초대 코드 (6자리)</p>
            <span className={styles.shortCode}>{latestInvite.shortCode}</span>
            <p className={styles.helper}>이 코드를 초대할 분에게 공유하세요.</p>
          </div>
        )}
      </div>

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
    </Modal>
  )
}

export default FamilyInvitePage

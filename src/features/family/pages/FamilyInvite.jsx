import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
import InviteMemberForm from '../components/InviteMemberForm.jsx'
import { useFamily } from '../hooks/useFamily'
import styles from './FamilyInvite.module.scss'

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
    createFamilyGroup,
    loading,
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
    createFamilyGroup: state.createFamilyGroup,
    loading: state.loading,
  }))

  // [Fixed] Derive familyGroup from familyGroups and selectedGroupId
  const familyGroup = useMemo(() => {
    return familyGroups?.find((g) => g.id === selectedGroupId) || null
  }, [familyGroups, selectedGroupId])

  const [submitting, setSubmitting] = useState(false)
  const [latestInvite, setLatestInvite] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)

  const sentInvites = useMemo(() => invites?.sent || [], [invites])
  const receivedInvites = useMemo(() => invites?.received || [], [invites])
  const hasGroup = Boolean(familyGroup?.id)

  useEffect(() => {
    // familyGroup이 없으면 강제로 다시 로드
    if (!familyGroup) {
      console.log('[FamilyInvite] familyGroup이 없음, 강제 로드')
      initialize?.({ force: true }).catch((error) =>
        console.warn('[FamilyInvite] initialize failed', error),
      )
    } else if (!initialized) {
      initialize?.().catch((error) =>
        console.warn('[FamilyInvite] initialize failed', error),
      )
    }
    loadInvites?.().catch((error) =>
      console.warn('[FamilyInvite] loadInvites failed', error),
    )
  }, [familyGroup, initialized, initialize, loadInvites])

  useEffect(() => {
    if (sentInvites?.length) {
      setLatestInvite(sentInvites[0])
    }
  }, [sentInvites])

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

  const handleRegenerate = async () => {
    if (!hasGroup) {
      toast.warning('먼저 가족 그룹을 생성해주세요.')
      return
    }
    const name = prompt('초대받을 분의 이름을 입력해주세요')
    const email = prompt('초대받을 분의 이메일을 입력해주세요')
    const suggestedRole = 'SENIOR'
    if (!email || !name) {
      toast.warning('이름과 이메일이 모두 필요합니다.')
      return
    }
    setRegenerating(true)
    try {
      const response = await inviteMember({ name, email, suggestedRole })
      if (response?.inviteCode) {
        setLatestInvite(response)
        toast.success('새 초대 링크가 생성되었습니다.')
      }
    } catch (error) {
      console.warn('[FamilyInvite] regenerate failed', error)
      toast.error('초대 링크를 다시 만들지 못했습니다. 잠시 후 재시도해 주세요.')
    } finally {
      setRegenerating(false)
    }
  }



  const handleCancel = async (inviteId) => {
    setCancelingId(inviteId)
    try {
      await cancelInvite?.(inviteId)
      await loadInvites?.()
      toast.success('초대가 취소되었습니다.')
    } catch (error) {
      console.warn('[FamilyInvite] cancelInvite failed', error)
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
      console.warn('[FamilyInvite] acceptInvite failed', error)
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
      console.warn('초대 링크 복사 실패:', err)
      toast.error('복사에 실패했습니다. 직접 선택하여 복사해 주세요.')
    }
  }

  const handleCreateGroup = async () => {
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
      await loadInvites?.()
    } catch (error) {
      console.warn('[FamilyInvite] createGroup failed', error)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '가족 그룹 생성에 실패했습니다. 다시 시도해주세요.'
      toast.error(message)
    } finally {
      setCreatingGroup(false)
    }
  }

  return (
    <Modal
      title="가족 초대"
      description={
        <>
          <span>그룹을 만든 뒤 이름과 이메일을 입력하면 초대 링크를 만들 수 있습니다.</span>
          <span>초대 링크를 복사하거나 코드로 공유해 가족을 초대하세요.</span>
        </>
      }
      onClose={() => navigate(ROUTE_PATHS.family, { replace: true })}
    >
      <div className={styles.groupCreateSection}>
        <div className={styles.groupCreateHeader}>
          <h3>가족 그룹 만들기</h3>
          {hasGroup && (
            <span className={styles.currentGroup}>
              현재 그룹: {familyGroup?.name || '이름 없음'} (ID: {familyGroup?.id})
            </span>
          )}
        </div>
        <p className={styles.helper}>
          초대는 그룹 생성자만 보낼 수 있습니다. 먼저 가족 그룹을 생성한 뒤 초대를 진행해주세요.
        </p>
        <div className={styles.groupRow}>
          <input
            type="text"
            value={groupName}
            placeholder="예) 우리 가족"
            onChange={(e) => setGroupName(e.target.value)}
            disabled={creatingGroup || loading}
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={creatingGroup || loading}
          >
            {creatingGroup ? '생성 중...' : '그룹 생성'}
          </button>
        </div>
        {!hasGroup && (
          <p className={styles.alert}>아직 생성된 가족 그룹이 없습니다. 그룹을 먼저 만들어주세요.</p>
        )}
      </div>

      <div className={styles.divider}></div>

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
          <button type="button" onClick={handleRegenerate} disabled={regenerating || !hasGroup}>
            {regenerating ? '재생성 중...' : '새로 만들기'}
          </button>
        </div>
        {!linkAvailable && (
          <p className={styles.helper}>초대 생성 후에 초대 링크가 표시됩니다. 먼저 초대를 만들어 주세요.</p>
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
                <li key={inviteId}>
                  <div className={styles.inviteMeta}>
                    <span className={styles.email}>{invite.inviteeEmail || '이메일 미지정'}</span>
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
                    onClick={() => handleCancel(inviteId)}
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

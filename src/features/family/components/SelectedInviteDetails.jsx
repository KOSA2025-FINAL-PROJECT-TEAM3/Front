import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import useKakao from '../../../core/hooks/useKakao.js'
import styles from './InviteMemberForm.module.scss' // Reusing some styles
import envConfig from '@config/environment.config'

const ROLE_LABELS = {
  SENIOR: '시니어',
  CAREGIVER: '보호자',
}

const SelectedInviteDetails = ({ invite, onClose, onCancel, onRoleChange, cancelingId }) => {
  const { shareInvite } = useKakao()
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState(invite?.suggestedRole || 'SENIOR')

  const inviteLink = useMemo(() => {
    if (!invite) return ''
    const origin = envConfig.FRONTEND_URL

    if (invite.longToken) {
      return `${origin}${ROUTE_PATHS.inviteLanding}?token=${invite.longToken}`
    }
    if (invite.inviteUrl) {
      return invite.inviteUrl
    }
    if (invite.shortCode || invite.inviteCode) {
      const code = invite.shortCode || invite.inviteCode
      return `${origin}${ROUTE_PATHS.inviteCodeEntry}?code=${code}`
    }
    return ''
  }, [invite])

  const linkAvailable = Boolean(inviteLink)

  const handleCopyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert('초대 링크가 복사되었습니다.'))
      .catch(() => alert('복사에 실패했습니다.'))
  }

  const handleKakaoShare = () => {
    if (!inviteLink) return
    shareInvite(inviteLink, invite.inviterName || '가족')
  }

  const handleSaveRole = () => {
    if (invite.id && selectedRole !== invite.suggestedRole) {
      onRoleChange(invite.id, selectedRole)
    }
    setIsEditingRole(false)
  }

  return (
    <div className={styles.resultSection}>
      <h4 className={styles.successTitle}>초대 정보 확인</h4>

      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>이름:</span>
        <span className={styles.infoValue}>{invite.inviteeName || '이름 미지정'}</span>
      </div>
      {invite.intendedForEmail && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>이메일:</span>
          <span className={styles.infoValue}>{invite.intendedForEmail}</span>
        </div>
      )}
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>만료 시각:</span>
        <span className={styles.infoValue}>
          {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString('ko-KR') : '정보 없음'}
        </span>
      </div>

      <div className={styles.linkContainer}>
        <input
          className={styles.linkInput}
          value={inviteLink}
          readOnly
        />
        <button type="button" className={styles.actionButton} onClick={handleCopyLink}>
          링크 복사
        </button>
      </div>

      <button type="button" className={styles.kakaoButton} onClick={handleKakaoShare} disabled={!linkAvailable}>
        카카오톡으로 공유하기
      </button>

      {invite.shortCode && (
        <div className={styles.shortCodeSection}>
          <p className={styles.helper}>수동 입력 코드</p>
          <span className={styles.shortCode}>{invite.shortCode}</span>
          <p className={styles.helper}>이 코드를 초대할 분에게 공유하세요.</p>
        </div>
      )}

      {/* Role Editing Section */}
      <div className={styles.roleEditSection}>
        <span className={styles.infoLabel}>예정된 역할:</span>
        {isEditingRole ? (
          <>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={styles.roleSelector}
            >
              <option value="SENIOR">{ROLE_LABELS.SENIOR}</option>
              <option value="CAREGIVER">{ROLE_LABELS.CAREGIVER}</option>
            </select>
            <button type="button" className={styles.actionButton} onClick={handleSaveRole}>
              저장
            </button>
            <button type="button" className={styles.actionButton} onClick={() => setIsEditingRole(false)}>
              취소
            </button>
          </>
        ) : (
          <>
            <span className={styles.infoValue}>{ROLE_LABELS[invite.suggestedRole] || invite.suggestedRole}</span>
            <button type="button" className={styles.actionButton} onClick={() => setIsEditingRole(true)}>
              역할 수정
            </button>
          </>
        )}
      </div>

      <div className={styles.actionsBottom}>
        <button type="button" className={styles.cancelInviteButton} onClick={() => onCancel(invite.id)} disabled={cancelingId === invite.id}>
          {cancelingId === invite.id ? '취소 중...' : '초대 취소'}
        </button>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

SelectedInviteDetails.propTypes = {
  invite: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
  cancelingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default SelectedInviteDetails
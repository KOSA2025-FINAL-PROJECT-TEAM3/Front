import PropTypes from 'prop-types'
import styles from './FamilyMemberCard.module.scss'

const roleLabels = {
  SENIOR: '어르신(부모)',
  CAREGIVER: '보호자(자녀)',
}

export const FamilyMemberCard = ({
  member,
  onDetail,
  onRemove,
  onSettings,
  isOnline,
  isRemoving,
  currentUserId,
  groupOwnerId,
  canManageNotifications,
}) => {
  if (!member) return null
  const initials = member.name?.[0] ?? 'U'
  const joinedDate = new Date(member.joinedAt).toLocaleDateString('ko-KR')

  const isCardSelf = member.userId?.toString?.() === currentUserId?.toString?.()
  const isCardGroupOwner =
    groupOwnerId != null && member.userId?.toString?.() === groupOwnerId?.toString?.()
  const isViewerGroupOwner =
    currentUserId != null &&
    groupOwnerId != null &&
    currentUserId?.toString?.() === groupOwnerId?.toString?.()
  const canOpenSettings = onSettings && !isCardSelf && canManageNotifications

  // 1. 관리자(ViewerOwner)는 본인 제외 다른 사람 제거 가능
  // 2. 일반 멤버는 본인만 탈퇴 가능 (단, 그룹장이면 탈퇴 불가 -> 해산 이용)
  const showRemove =
    (isViewerGroupOwner && !isCardSelf) || (isCardSelf && !isCardGroupOwner)

  const removeLabel = isCardSelf ? '탈퇴' : '제거'

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar} style={{ backgroundColor: member.avatarColor || '#c7d2fe' }}>
          {initials}
        </div>
        {isOnline && <span className={styles.onlineDot} aria-label="온라인" />}
      </div>
      <div className={styles.info}>
        <div className={styles.topRow}>
          <span className={styles.name}>{member.name}</span>
          <span className={styles.role}>{roleLabels[member.role] || member.role}</span>
        </div>
        <p className={styles.meta}>가입일: {joinedDate}</p>
        <p className={styles.meta}>{member.email}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.detailButton} onClick={() => onDetail?.(member.id)}>
          상세
        </button>
        {canOpenSettings && (
          <button
            type="button"
            className={styles.settingsButton}
            onClick={() => onSettings?.(member.userId)}
            title="알림 설정"
          >
            ⚙️
          </button>
        )}
        {showRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove?.(member.id)}
            disabled={isRemoving}
            aria-busy={isRemoving}
          >
            {isRemoving ? `${removeLabel} 중...` : removeLabel}
          </button>
        )}
      </div>
    </div>
  )
}

FamilyMemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['SENIOR', 'CAREGIVER']).isRequired,
    joinedAt: PropTypes.string.isRequired,
    avatarColor: PropTypes.string,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onDetail: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onSettings: PropTypes.func,
  isOnline: PropTypes.bool,
  isRemoving: PropTypes.bool,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  canManageNotifications: PropTypes.bool,
}

FamilyMemberCard.defaultProps = {
  isOnline: false,
  isRemoving: false,
  currentUserId: null,
  groupOwnerId: null,
  canManageNotifications: false,
}

export default FamilyMemberCard

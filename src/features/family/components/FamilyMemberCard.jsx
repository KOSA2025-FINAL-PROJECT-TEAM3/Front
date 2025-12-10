import { useState } from 'react'
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
  onRoleChange,
  isRemoving,
  isRoleChanging,
  currentUserId,
  groupOwnerId,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

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

  // 역할 변경 권한: 그룹 소유자 또는 본인
  const canChangeRole = isViewerGroupOwner || isCardSelf

  // 제거 권한
  const showRemove =
    (isViewerGroupOwner && !isCardSelf) || (isCardSelf && !isCardGroupOwner)

  const removeLabel = isCardSelf ? '탈퇴' : '제거'
  const currentRole = member.role
  const oppositeRole = currentRole === 'SENIOR' ? 'CAREGIVER' : 'SENIOR'

  const handleRoleToggle = () => {
    if (!canChangeRole || isRoleChanging) return
    setShowRoleDropdown(false)
    onRoleChange?.(member.id, oppositeRole)
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar} style={{ backgroundColor: member.avatarColor || '#c7d2fe' }}>
          {initials}
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.topRow}>
          <span className={styles.name}>{member.name}</span>
          <div className={styles.roleContainer}>
            {canChangeRole && onRoleChange ? (
              <button
                type="button"
                className={styles.roleButton}
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                disabled={isRoleChanging}
                title="역할 변경"
              >
                {isRoleChanging ? '변경 중...' : roleLabels[currentRole] || currentRole}
                <span className={styles.dropdownArrow}>▼</span>
              </button>
            ) : (
              <span className={styles.role}>{roleLabels[currentRole] || currentRole}</span>
            )}
            {showRoleDropdown && (
              <div className={styles.roleDropdown}>
                <button type="button" onClick={handleRoleToggle}>
                  {roleLabels[oppositeRole]}(으)로 변경
                </button>
              </div>
            )}
          </div>
        </div>
        <p className={styles.meta}>가입일: {joinedDate}</p>
        <p className={styles.meta}>{member.email}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.detailButton} onClick={() => onDetail?.(member.id)}>
          상세
        </button>
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
  onRoleChange: PropTypes.func,
  isRemoving: PropTypes.bool,
  isRoleChanging: PropTypes.bool,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  groupOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

FamilyMemberCard.defaultProps = {
  onRoleChange: null,
  isRemoving: false,
  isRoleChanging: false,
  currentUserId: null,
  groupOwnerId: null,
}

export default FamilyMemberCard
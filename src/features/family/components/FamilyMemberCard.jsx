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
  isOnline,
  isRemoving,
}) => {
  if (!member) return null
  const initials = member.name?.[0] ?? 'U'
  const joinedDate = new Date(member.joinedAt).toLocaleDateString('ko-KR')

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
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => onRemove?.(member.id)}
          disabled={isRemoving}
          aria-busy={isRemoving}
        >
          {isRemoving ? '제거 중...' : '제거'}
        </button>
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
  }).isRequired,
  onDetail: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isOnline: PropTypes.bool,
  isRemoving: PropTypes.bool,
}

FamilyMemberCard.defaultProps = {
  isOnline: false,
  isRemoving: false,
}

export default FamilyMemberCard

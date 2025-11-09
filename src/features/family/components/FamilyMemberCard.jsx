import styles from './FamilyMemberCard.module.scss'

const roleLabels = {
  SENIOR: '시니어',
  CAREGIVER: '보호자',
}

export const FamilyMemberCard = ({ member, onDetail, onRemove, isOnline }) => {
  if (!member) return null
  const initials = member.name?.[0] ?? '멤'
  const joinedDate = new Date(member.joinedAt).toLocaleDateString('ko-KR')

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        <div
          className={styles.avatar}
          style={{ backgroundColor: member.avatarColor || '#c7d2fe' }}
        >
          {initials}
        </div>
        {isOnline && <span className={styles.onlineDot} aria-label="온라인" />}
      </div>
      <div className={styles.info}>
        <div className={styles.topRow}>
          <span className={styles.name}>{member.name}</span>
          <span className={styles.role}>
            {roleLabels[member.role] || member.role}
          </span>
        </div>
        <p className={styles.meta}>가입일: {joinedDate}</p>
        <p className={styles.meta}>{member.email}</p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.detailButton}
          onClick={() => onDetail?.(member.id)}
        >
          상세
        </button>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => onRemove?.(member.id)}
        >
          제거
        </button>
      </div>
    </div>
  )
}

export default FamilyMemberCard

import PropTypes from 'prop-types'
import styles from './FamilyGroupCard.module.scss'

export const FamilyGroupCard = ({ group, memberCount = 0 }) => {
  if (!group) return null

  const createdDate = new Date(group.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // [Fixed] ownerId is the current owner, find name from members
  const owner = group.members?.find(
    (m) =>
      String(m.id) === String(group.ownerId || group.createdBy) ||
      String(m.userId) === String(group.ownerId || group.createdBy),
  )
  const ownerName = owner?.name || group.createdBy?.name || '알 수 없음'

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{group.name}</h2>
        <span className={styles.badge}>{memberCount}명 참여</span>
      </div>
      <div className={styles.meta}>
        <span>소유자: {ownerName}</span>
        <span>생성일: {createdDate}</span>
      </div>
    </section>
  )
}

FamilyGroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    createdAt: PropTypes.string,
    createdBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
    ]),
    members: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  memberCount: PropTypes.number,
}

FamilyGroupCard.defaultProps = {
  memberCount: 0,
}

export default FamilyGroupCard

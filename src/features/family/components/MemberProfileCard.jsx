import PropTypes from 'prop-types'
import styles from './MemberProfileCard.module.scss'

const roleLabels = {
  SENIOR: '시니어',
  CAREGIVER: '보호자',
}

export const MemberProfileCard = ({ member }) => {
  if (!member) return null
  return (
    <section className={styles.card}>
      <div className={styles.avatar} style={{ backgroundColor: member.avatarColor || '#c4b5fd' }}>
        {member.name?.[0] ?? '멤'}
      </div>
      <div className={styles.info}>
        <h2>{member.name}</h2>
        <p className={styles.role}>{roleLabels[member.role] || member.role}</p>
        <p>{member.email}</p>
        <p>가입일: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}</p>
      </div>
    </section>
  )
}

MemberProfileCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['SENIOR', 'CAREGIVER']).isRequired,
    joinedAt: PropTypes.string.isRequired,
    avatarColor: PropTypes.string,
  }).isRequired,
}

export default MemberProfileCard

import styles from './FamilyGroupCard.module.scss'

export const FamilyGroupCard = ({ group, memberCount = 0 }) => {
  if (!group) return null

  const createdDate = new Date(group.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{group.name}</h2>
        <span className={styles.badge}>{memberCount}명 참여</span>
      </div>
      <div className={styles.meta}>
        <span>생성자: {group.createdBy?.name}</span>
        <span>생성일: {createdDate}</span>
      </div>
    </section>
  )
}

export default FamilyGroupCard

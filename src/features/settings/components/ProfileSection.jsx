import styles from './ProfileSection.module.scss'

export const ProfileSection = ({ user }) => {
  if (!user) {
    return (
      <section className={styles.profileSection}>
        <div className={styles.avatarPlaceholder}>?</div>
        <div>
          <p className={styles.name}>게스트</p>
          <p className={styles.email}>로그인이 필요합니다</p>
        </div>
      </section>
    )
  }

  const initials = user.name?.[0] ?? 'U'

  return (
    <section className={styles.profileSection}>
      <div className={styles.avatar}>
        {initials}
      </div>
      <div>
        <p className={styles.name}>{user.name}</p>
        <p className={styles.email}>{user.email}</p>
      </div>
    </section>
  )
}

export default ProfileSection

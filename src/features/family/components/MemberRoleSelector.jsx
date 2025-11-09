import styles from './MemberRoleCard.module.scss'

const ROLE_OPTIONS = [
  { value: 'SENIOR', label: '시니어', icon: '👴' },
  { value: 'CAREGIVER', label: '보호자', icon: '👨‍👩‍👧' },
]

export const MemberRoleSelector = ({ value, onChange, disabled }) => {
  return (
    <div className={styles.roleSelector}>
      {ROLE_OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.roleCard} ${active ? styles.active : ''}`}
            onClick={() => onChange?.(option.value)}
            disabled={disabled}
          >
            <span className={styles.roleIcon}>{option.icon}</span>
            <span className={styles.roleLabel}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MemberRoleSelector

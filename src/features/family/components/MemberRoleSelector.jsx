import { MEMBER_ROLE_OPTIONS } from '@/constants/uiConstants'
import styles from './MemberRoleCard.module.scss'

export const MemberRoleSelector = ({ value, onChange, disabled }) => {
  return (
    <div className={styles.roleSelector}>
      {MEMBER_ROLE_OPTIONS.map((option) => {
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

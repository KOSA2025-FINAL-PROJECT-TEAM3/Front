/**
 * Quick Actions Component
 * @component QuickActions
 */

import { useNavigate } from 'react-router-dom'
import styles from './QuickActions.module.scss'

/**
 * Quick Actions Grid Component
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects {icon, label, path, onClick}
 * @returns {JSX.Element}
 */
export const QuickActions = ({ actions }) => {
  const navigate = useNavigate()

  const handleClick = (action) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      navigate(action.path)
    }
  }

  return (
    <div className={styles.quickActions}>
      <h2 className={styles.title}>빠른 작업</h2>
      <div className={styles.grid}>
        {actions.map((action, index) => (
          <button
            key={index}
            type="button"
            className={styles.actionCard}
            onClick={() => handleClick(action)}
            aria-label={action.label}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>{action.icon}</span>
            </div>
            <span className={styles.label}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

/**
 * BackButton Component
 * - 뒤로가기 버튼
 */

import { useNavigate } from 'react-router-dom'
import styles from './BackButton.module.scss'

export const BackButton = ({ onClick, label = '뒤로가기' }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={handleClick}
      aria-label={label}
    >
      <span className={styles.icon}>←</span>
      <span className={styles.label}>{label}</span>
    </button>
  )
}

export default BackButton

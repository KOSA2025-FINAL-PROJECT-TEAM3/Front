/**
 * Floating Action Button Component
 * @component FAB
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './FAB.module.scss'

/**
 * Floating Action Button with expandable menu
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects {icon, label, path, onClick}
 * @returns {JSX.Element}
 */
export const FAB = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      navigate(action.path)
    }
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <div className={styles.fabContainer}>
        {isOpen && (
          <div className={styles.menu}>
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className={styles.menuItem}
                onClick={() => handleActionClick(action)}
                aria-label={action.label}
              >
                <span className={styles.menuIcon}>{action.icon}</span>
                <span className={styles.menuLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className={`${styles.fab} ${isOpen ? styles.open : ''}`}
          onClick={handleToggle}
          aria-label={isOpen ? '메뉴 닫기' : '빠른 작업 메뉴'}
        >
          <span className={styles.fabIcon}>{isOpen ? '✕' : '+'}</span>
        </button>
      </div>
    </>
  )
}

export default FAB

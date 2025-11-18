/**
 * Toast Component
 * - 개별 토스트 알림
 */

import { useEffect, useState } from 'react'
import { useToastStore } from './toastStore'
import styles from './Toast.module.scss'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export const Toast = ({ id, type, message }) => {
  const [isExiting, setIsExiting] = useState(false)
  const removeToast = useToastStore((state) => state.removeToast)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(id)
    }, 300) // 애니메이션 시간
  }

  useEffect(() => {
    // 자동 닫기 애니메이션 시작
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, 2700) // duration - 300ms

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isExiting ? styles.exit : ''}`}
      onClick={handleClose}
      role="alert"
    >
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  )
}

export default Toast

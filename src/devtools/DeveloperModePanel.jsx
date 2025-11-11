/**
 * DeveloperModePanel
 * - 개발 모드 진입/바로가기 패널 (UI는 SCSS 모듈)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS, USER_ROLES } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuthStore } from '@features/auth/store/authStore'
import { resetFamilyMockData } from '@features/family/services/familyService'
import { MOCK_DIET_LOGS } from '@/data/mockDiet'
import styles from './DeveloperModePanel.module.scss'

const DEV_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEV_MODE !== 'false'

const DEV_PROFILES = {
  [USER_ROLES.SENIOR]: {
    id: 'dev-senior',
    name: '김어르신',
    email: 'senior@amapill.dev',
    role: USER_ROLES.SENIOR,
  },
  [USER_ROLES.CAREGIVER]: {
    id: 'dev-caregiver',
    name: '홍보호자',
    email: 'caregiver@amapill.dev',
    role: USER_ROLES.CAREGIVER,
  },
}

const seedDietLogs = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.DIET_LOGS, JSON.stringify(MOCK_DIET_LOGS))
}

const resetAllMockData = () => {
  resetFamilyMockData()
  seedDietLogs()
}

export const DeveloperModePanel = () => {
  const [open, setOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusLevel, setStatusLevel] = useState('info')
  const navigate = useNavigate()
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const clearAuthState = useAuthStore((state) => state.clearAuthState)

  if (!DEV_MODE_ENABLED) return null

  const persistDevAuth = (role) => {
    if (typeof window === 'undefined') return null
    const now = Date.now()
    const userProfile = DEV_PROFILES[role] || DEV_PROFILES[USER_ROLES.SENIOR]

    const token = `dev-token-${now}`
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    window.localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile))
    window.localStorage.setItem(STORAGE_KEYS.ROLE, role)
    window.localStorage.setItem(STORAGE_KEYS.DEV_MODE, 'true')
    return { token, userProfile }
  }

  const clearDevAuth = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    window.localStorage.removeItem(STORAGE_KEYS.ROLE)
    window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
    window.localStorage.removeItem(STORAGE_KEYS.FAMILY_GROUP)
    window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)
  }

  const showStatus = (message, level = 'info') => {
    setStatusMessage(message)
    setStatusLevel(level)
  }

  const handleShortcut = async (role, path) => {
    const record = persistDevAuth(role)
    if (record?.userProfile) {
      setAuthData({ user: record.userProfile, token: record.token, role })
    }
    resetAllMockData()
    showStatus('Dev 프로필과 목데이터 전체를 초기화했어요.', 'success')
    setOpen(false)
    navigate(path, { replace: true })
  }

  const handleClear = () => {
    clearDevAuth()
    clearAuthState()
    showStatus('Dev Mode 상태가 초기화됐어요.', 'info')
    setOpen(false)
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  const handleResetMockData = () => {
    resetAllMockData()
    showStatus('모든 목데이터를 기본값으로 되돌렸어요.', 'success')
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        🧪 Dev Mode
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>개발자 바로가기</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <ul className={styles.shortcutList}>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, ROUTE_PATHS.roleSelection)}
              >
                역할 선택 (Stage 2)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, ROUTE_PATHS.seniorDashboard)}
              >
                어르신 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, ROUTE_PATHS.caregiverDashboard)}
              >
                보호자 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.shortcutButton} ${styles.secondaryAction}`}
                onClick={handleResetMockData}
              >
                목데이터 전부 초기화
              </button>
            </li>
            <li>
              <hr className={styles.divider} aria-hidden="true" />
            </li>
            <li>
              <button
                type="button"
                className={`${styles.shortcutButton} ${styles.resetButton}`}
                onClick={handleClear}
              >
                Dev Mode 초기화
              </button>
            </li>
          </ul>
          {statusMessage && (
            <p className={`${styles.statusMessage} ${styles[`status-${statusLevel}`]}`}>
              {statusMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default DeveloperModePanel

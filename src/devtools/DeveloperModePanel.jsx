/**
 * DeveloperModePanel
 * - 개발 모드 진입/바로가기 패널 (UI는 SCSS 모듈)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS, USER_ROLES } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuthStore } from '@/stores/authStore'
import { DEFAULT_FAMILY_GROUP, DEFAULT_FAMILY_MEMBERS } from '@/data/mockFamily'
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
    id: 'dev-guardian',
    name: '홍보호자',
    email: 'guardian@amapill.dev',
    role: USER_ROLES.CAREGIVER,
  },
}

const seedFamilyData = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    STORAGE_KEYS.FAMILY_GROUP,
    JSON.stringify({ group: DEFAULT_FAMILY_GROUP, members: DEFAULT_FAMILY_MEMBERS }),
  )
}

export const DeveloperModePanel = () => {
  const [open, setOpen] = useState(false)
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
    seedFamilyData()
    return { token, userProfile }
  }

  const clearDevAuth = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    window.localStorage.removeItem(STORAGE_KEYS.ROLE)
    window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
    window.localStorage.removeItem(STORAGE_KEYS.FAMILY_GROUP)
  }

  const handleShortcut = (role, path) => {
    const record = persistDevAuth(role)
    if (record?.userProfile) {
      setAuthData({ user: record.userProfile, token: record.token, role })
    }
    setOpen(false)
    navigate(path, { replace: true })
  }

  const handleClear = () => {
    clearDevAuth()
    clearAuthState()
    setOpen(false)
    navigate(ROUTE_PATHS.login, { replace: true })
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
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, ROUTE_PATHS.guardianDashboard)}
              >
                보호자 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, ROUTE_PATHS.family)}
              >
                가족 관리 (Stage 3)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, ROUTE_PATHS.medication)}
              >
                약 관리 (Stage 4 CRUD)
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
        </div>
      )}
    </div>
  )
}

export default DeveloperModePanel

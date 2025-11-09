/**
 * DeveloperModePanel
 * - 개발 모드 단축키 실행기 (공유 UI 외부에 유지)
 * - 전역 스타일 유출 방지를 위해 SCSS 모듈 사용
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS, USER_ROLES } from '@config/constants'
import { useAuthStore } from '@/stores/authStore'
import { DEFAULT_FAMILY_GROUP, DEFAULT_FAMILY_MEMBERS } from '@/data/mockFamily'
import styles from './DeveloperModePanel.module.scss'

const DEV_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEV_MODE !== 'false'

const DEV_PROFILES = {
  [USER_ROLES.SENIOR]: {
    id: 'dev-senior',
    name: '김시니어',
    email: 'senior@amapill.dev',
    role: USER_ROLES.SENIOR,
  },
  [USER_ROLES.CAREGIVER]: {
    id: 'dev-guardian',
    name: '이지킴',
    email: 'guardian@amapill.dev',
    role: USER_ROLES.CAREGIVER,
  },
}

const seedFamilyData = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    STORAGE_KEYS.FAMILY_GROUP,
    JSON.stringify({
      group: DEFAULT_FAMILY_GROUP,
      members: DEFAULT_FAMILY_MEMBERS,
    }),
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
      setAuthData({
        user: record.userProfile,
        token: record.token,
        role,
      })
    }
    if (typeof window !== 'undefined') {
      window.location.href = path
    } else {
      setOpen(false)
      navigate(path, { replace: true })
    }
  }

  const handleClear = () => {
    clearDevAuth()
    clearAuthState()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    } else {
      setOpen(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        ⚙️ Dev Mode
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Developer Shortcuts</span>
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
                onClick={() => handleShortcut(USER_ROLES.SENIOR, '/role-selection')}
              >
                🧭 역할 선택 (Stage 2)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, '/dashboard')}
              >
                👵 시니어 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, '/guardian')}
              >
                👨‍👩‍👧 보호자 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, '/family')}
              >
                👨‍👩‍👧‍👦 가족 관리 (Stage 3)
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
                🔒 Dev Mode 토큰 초기화
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default DeveloperModePanel

/**
 * DeveloperModePanel
 * - 백엔드 없이 화면을 검증할 수 있도록 더미 계정을 주입하는 플로팅 메뉴
 * - VITE_ENABLE_DEV_MODE !== 'false' 인 경우에만 노출
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS, USER_ROLES } from '@config/constants'

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

const containerStyle = {
  position: 'fixed',
  left: 16,
  bottom: 16,
  zIndex: 9999,
}

const buttonStyle = {
  backgroundColor: '#1e40af',
  color: '#fff',
  borderRadius: 9999,
  padding: '10px 16px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 10px 25px rgba(30,64,175,0.35)',
  fontWeight: 600,
}

const panelStyle = {
  marginTop: 8,
  width: 260,
  backgroundColor: '#fff',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 16px 40px rgba(15,23,42,0.15)',
  overflow: 'hidden',
}

const panelHeaderStyle = {
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  color: '#fff',
  padding: '10px 14px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const listStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 8,
}

const listButtonStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'transparent',
  border: 'none',
  borderRadius: 8,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 14,
}

const persistDevAuth = (role) => {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const userProfile = DEV_PROFILES[role] || DEV_PROFILES[USER_ROLES.SENIOR]

  window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `dev-token-${now}`)
  window.localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile))
  window.localStorage.setItem(STORAGE_KEYS.ROLE, role)
  window.localStorage.setItem(STORAGE_KEYS.DEV_MODE, 'true')
}

const clearDevAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
}

export const DeveloperModePanel = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!DEV_MODE_ENABLED) return null

const handleShortcut = (role, path) => {
  persistDevAuth(role)
  if (typeof window !== 'undefined') {
    window.location.href = path
  } else {
    setOpen(false)
    navigate(path, { replace: true })
  }
}

const handleClear = () => {
  clearDevAuth()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  } else {
    setOpen(false)
    navigate('/login', { replace: true })
  }
}

  return (
    <div style={containerStyle}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        ⚙️ Dev Mode
      </button>

      {open && (
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span>Developer Shortcuts</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#bfdbfe',
                fontSize: 16,
                cursor: 'pointer',
              }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <ul style={listStyle}>
            <li>
              <button
                type="button"
                style={listButtonStyle}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, '/role-selection')}
              >
                🧭 역할 선택 (Stage 2)
              </button>
            </li>
            <li>
              <button
                type="button"
                style={listButtonStyle}
                onClick={() => handleShortcut(USER_ROLES.SENIOR, '/dashboard')}
              >
                👵 시니어 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                style={listButtonStyle}
                onClick={() => handleShortcut(USER_ROLES.CAREGIVER, '/guardian')}
              >
                👨‍👩‍👧 보호자 대시보드
              </button>
            </li>
            <li>
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
            </li>
            <li>
              <button
                type="button"
                style={{ ...listButtonStyle, color: '#dc2626', fontWeight: 600 }}
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

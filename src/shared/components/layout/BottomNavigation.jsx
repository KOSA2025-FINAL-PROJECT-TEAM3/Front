/**
 * BottomNavigation Component
 * - 하단 네비게이션 메뉴
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import styles from './BottomNavigation.module.scss'

const makeMenu = (homePath) => [
  { id: 'home', label: '홈', icon: '🏠', path: homePath, roles: 'ALL' },
  { id: 'medication', label: '약 관리', icon: '💊', path: ROUTE_PATHS.medication, roles: 'ALL' },
  { id: 'search', label: '증상 검색', icon: '🔎', path: ROUTE_PATHS.search, roles: 'ALL' },
  { id: 'family', label: '가족', icon: '👨‍👩‍👧', path: ROUTE_PATHS.family, roles: 'ALL' },
  { id: 'disease', label: '질환', icon: '🩺', path: ROUTE_PATHS.disease, roles: 'ALL' },
  { id: 'diet', label: '식이 경고', icon: '⚠️', path: ROUTE_PATHS.dietWarning, roles: 'ALL' },
  { id: 'ocr', label: 'OCR', icon: '📸', path: ROUTE_PATHS.ocrScan, roles: 'ALL' },
  { id: 'counsel', label: '의사와 상담', icon: '💬', path: ROUTE_PATHS.counsel, roles: 'ALL' },
  { id: 'settings', label: '설정', icon: '⚙️', path: ROUTE_PATHS.settings, roles: 'ALL' },
]

export const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, role } = useAuth((state) => ({ logout: state.logout, role: state.role }))

  // 역할 기반 홈 경로 분기
  const isCaregiver = role === USER_ROLES.CAREGIVER || role === 'CAREGIVER' || role === 'caregiver'
  const homePath = isCaregiver ? ROUTE_PATHS.guardianDashboard : ROUTE_PATHS.seniorDashboard
  const menuItems = makeMenu(homePath).filter((item) => item.roles === 'ALL')

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="하단 네비게이션">
      <div className={styles.navContainer}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
            type="button"
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`${styles.navItem} ${styles.logout}`}
          onClick={async () => {
            await logout()
            navigate(ROUTE_PATHS.login, { replace: true })
          }}
          aria-label="로그아웃"
        >
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navLabel}>로그아웃</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNavigation

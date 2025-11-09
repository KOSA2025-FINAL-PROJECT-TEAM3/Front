/**
 * BottomNavigation Component
 * - 하단 메뉴바 (Vision Pro 스타일)
 * - 6개 메뉴: 홈, 약관리, 증상검색, 약사상담, 질병관리, 설정
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import styles from './BottomNavigation.module.scss'

const menuItems = [
  { id: 'home', label: '홈', icon: '🏠', path: '/dashboard' },
  { id: 'medication', label: '약관리', icon: '💊', path: '/medication' },
  { id: 'search', label: '증상검색', icon: '🔍', path: '/search' },
  { id: 'family', label: '가족', icon: '👨‍👩‍👧', path: '/family' },
  { id: 'diet', label: '음식경고', icon: '🍽', path: '/diet/warning' },
  { id: 'ocr', label: 'OCR', icon: '📷', path: '/ocr/scan' },
  { id: 'counsel', label: '약사상담', icon: '💬', path: '/counsel' },
  { id: 'settings', label: '설정', icon: '⚙️', path: '/settings' },
]

/**
 * 하단 네비게이션 메뉴바
 * @returns {JSX.Element} 메뉴바 컴포넌트
 */
export const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth((state) => ({
    logout: state.logout,
  }))

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
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
            navigate('/login', { replace: true })
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

/**
 * BottomNavigation Component
 * - 하단 네비게이션 메뉴
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { Icon } from '@shared/components/ui/Icon'
import styles from './BottomNavigation.module.scss'

const ROLE_ALL = 'ALL'

const NAV_ITEMS = [
  {
    id: 'home',
    label: '홈',
    icon: 'home',
    roles: [ROLE_ALL],
    getPath: ({ isCaregiver }) =>
      isCaregiver ? ROUTE_PATHS.caregiverDashboard : ROUTE_PATHS.seniorDashboard,
  },
  { id: 'medication', label: '약 관리', icon: 'pill', path: ROUTE_PATHS.medication },
  { id: 'medicationAdd', label: '약 등록', icon: 'plus', path: ROUTE_PATHS.medicationAdd },
  { id: 'pillSearch', label: '알약 검색', icon: 'search', path: ROUTE_PATHS.pillSearch },
  { id: 'search', label: '증상 검색', icon: 'search', path: ROUTE_PATHS.search },
  {
    id: 'family',
    label: '가족',
    icon: 'family',
    path: ROUTE_PATHS.family,
    roles: [USER_ROLES.CAREGIVER],
  },
  { id: 'disease', label: '질환', icon: 'disease', path: ROUTE_PATHS.disease },
  { id: 'diet', label: '식이 경고', icon: 'diet', path: ROUTE_PATHS.dietWarning },
  { id: 'dietLog', label: '식단 기록', icon: 'list', path: ROUTE_PATHS.dietLog },
  { id: 'ocr', label: 'OCR', icon: 'ocr', path: ROUTE_PATHS.ocrScan },
  { id: 'counsel', label: '의사와 상담', icon: 'counsel', path: ROUTE_PATHS.counsel },
  { id: 'notifications', label: '알림', icon: 'bell', path: ROUTE_PATHS.notifications },
  {
    id: 'reports',
    label: '리포트',
    icon: 'chart',
    path: ROUTE_PATHS.adherenceReport,
    roles: [USER_ROLES.CAREGIVER],
  },
  { id: 'settings', label: '설정', icon: 'settings', path: ROUTE_PATHS.settings },
]

const isRoleAllowed = (roles = [ROLE_ALL], role) =>
  roles.includes(ROLE_ALL) || roles.includes(role)

export const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, role } = useAuth((state) => ({ logout: state.logout, role: state.role }))

  const roleKey =
    role === USER_ROLES.CAREGIVER || role === 'CAREGIVER' || role === 'caregiver'
      ? USER_ROLES.CAREGIVER
      : USER_ROLES.SENIOR
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER

  const menuItems = NAV_ITEMS.filter((item) => isRoleAllowed(item.roles, roleKey)).map((item) => ({
    ...item,
    path: typeof item.getPath === 'function' ? item.getPath({ isCaregiver }) : item.path,
  }))

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  const handleNavigate = (path) => navigate(path)

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="하단 네비게이션">
      <div className={styles.navContainer}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => handleNavigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
            type="button"
          >
            <span className={styles.navIcon}>
              <Icon name={item.icon} aria-hidden />
            </span>
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
          <span className={styles.navIcon}>
            <Icon name="logout" aria-hidden />
          </span>
          <span className={styles.navLabel}>로그아웃</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNavigation

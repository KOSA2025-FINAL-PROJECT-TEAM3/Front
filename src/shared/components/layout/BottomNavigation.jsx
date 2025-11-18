/**
 * BottomNavigation Component
 * - 하단 네비게이션 메뉴
 * - 4-5개 핵심 메뉴만 표시
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { Icon } from '@shared/components/ui/Icon'
import styles from './BottomNavigation.module.scss'

const ROLE_ALL = 'ALL'

// 핵심 메뉴만 하단바에 표시 (4-5개)
const NAV_ITEMS = [
  {
    id: 'home',
    label: '홈',
    icon: 'home',
    roles: [ROLE_ALL],
    getPath: ({ isCaregiver }) =>
      isCaregiver ? ROUTE_PATHS.caregiverDashboard : ROUTE_PATHS.seniorDashboard,
  },
  {
    id: 'medication',
    label: '약',
    icon: 'pill',
    path: ROUTE_PATHS.medication,
    roles: [ROLE_ALL],
  },
  {
    id: 'search',
    label: '검색',
    icon: 'search',
    path: ROUTE_PATHS.pillSearch,
    roles: [ROLE_ALL],
  },
  {
    id: 'family',
    label: '가족',
    icon: 'family',
    path: ROUTE_PATHS.family,
    roles: [USER_ROLES.CAREGIVER], // 보호자만 표시
  },
  {
    id: 'more',
    label: '더보기',
    icon: 'settings',
    path: ROUTE_PATHS.more,
    roles: [ROLE_ALL],
  },
]

const isRoleAllowed = (roles = [ROLE_ALL], role) =>
  roles.includes(ROLE_ALL) || roles.includes(role)

export const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth((state) => ({ role: state.role }))

  const roleKey =
    role === USER_ROLES.CAREGIVER || role === 'CAREGIVER' || role === 'caregiver'
      ? USER_ROLES.CAREGIVER
      : USER_ROLES.SENIOR
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER

  const menuItems = NAV_ITEMS.filter((item) => isRoleAllowed(item.roles, roleKey)).map((item) => ({
    ...item,
    path: typeof item.getPath === 'function' ? item.getPath({ isCaregiver }) : item.path,
  }))

  const isActive = (path) => {
    // 더보기 메뉴의 경우, 하위 메뉴들도 활성화 표시
    if (path === ROUTE_PATHS.more) {
      const moreRelatedPaths = [
        ROUTE_PATHS.more,
        ROUTE_PATHS.notifications,
        ROUTE_PATHS.adherenceReport,
        ROUTE_PATHS.weeklyStats,
        ROUTE_PATHS.ocrScan,
        ROUTE_PATHS.counsel,
        ROUTE_PATHS.disease,
        ROUTE_PATHS.dietWarning,
        ROUTE_PATHS.dietLog,
        ROUTE_PATHS.settings,
      ]
      return moreRelatedPaths.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + '/')
      )
    }

    // 검색 메뉴의 경우, 알약검색/증상검색 모두 활성화
    if (path === ROUTE_PATHS.pillSearch) {
      return (
        location.pathname === ROUTE_PATHS.pillSearch ||
        location.pathname === ROUTE_PATHS.search ||
        location.pathname.startsWith(ROUTE_PATHS.pillSearch + '/') ||
        location.pathname.startsWith(ROUTE_PATHS.search + '/')
      )
    }

    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

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
      </div>
    </nav>
  )
}

export default BottomNavigation

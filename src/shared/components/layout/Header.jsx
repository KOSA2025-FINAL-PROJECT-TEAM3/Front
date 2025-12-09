/**
 * Header Component
 * - 상단 헤더 (Vision Pro 스타일)
 * - 로고, 앱 이름, 사용자 정보, 알림 배지
 * - 자동으로 auth store와 notification store에서 데이터 가져옴
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { getCustomerRoleLabel } from '@features/auth/utils/roleUtils'
import styles from './Header.module.scss'

/**
 * 상단 헤더 컴포넌트
 * @returns {JSX.Element} 헤더 컴포넌트
 */
export const Header = () => {
  const navigate = useNavigate()
  const { user, customerRole, logout } = useAuth((state) => ({
    user: state.user,
    customerRole: state.customerRole,
    logout: state.logout,
  }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  const handleNotificationClick = () => {
    navigate(ROUTE_PATHS.notifications)
  }

  // 사용자 이름 가져오기
  const userName = user?.name || user?.email?.split('@')[0] || '사용자'

  // 역할 라벨
  const roleLabel = getCustomerRoleLabel(customerRole)

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* 좌측: 로고 및 앱 이름 */}
        <div 
          className={styles.logoSection} 
          onClick={() => navigate(ROUTE_PATHS.root)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className={styles.logoIcon}>💊</div>
          <span className={styles.appName}>뭐냑? (AMA...Pill)</span>
        </div>

        {/* 우측: 사용자 정보 및 알림 */}
        <div className={styles.rightSection}>
          <div 
            className={styles.userInfo}
            onClick={() => navigate(ROUTE_PATHS.settingsProfile)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
          >
            <span className={styles.userName}>{userName} 님</span>
            <span className={styles.userRole}>({roleLabel})</span>
            <button 
              className={styles.logoutBtn} 
              onClick={() => {
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  logout()
                  navigate(ROUTE_PATHS.login)
                }
              }}
            >
              로그아웃
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.notificationBadge}
              onClick={handleNotificationClick}
              aria-label={`읽지 않은 알림 ${unreadCount}개`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

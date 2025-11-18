/**
 * Header Component
 * - 상단 헤더 (Vision Pro 스타일)
 * - 로고, 앱 이름, 사용자 정보, 알림 배지
 * - 자동으로 auth store와 notification store에서 데이터 가져옴
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { USER_ROLES } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './Header.module.scss'

/**
 * 상단 헤더 컴포넌트
 * @returns {JSX.Element} 헤더 컴포넌트
 */
export const Header = () => {
  const navigate = useNavigate()
  const { user, role } = useAuth((state) => ({ user: state.user, role: state.role }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  const handleNotificationClick = () => {
    navigate(ROUTE_PATHS.notifications)
  }

  // 사용자 이름 가져오기
  const userName = user?.name || user?.email?.split('@')[0] || '사용자'

  // 역할 라벨
  const roleLabel =
    role === USER_ROLES.CAREGIVER ? '보호자' : role === USER_ROLES.SENIOR ? '어르신' : '사용자'

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* 좌측: 로고 및 앱 이름 */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>💊</div>
          <span className={styles.appName}>뭐냑? (AMA...Pill)</span>
        </div>

        {/* 우측: 사용자 정보 및 알림 */}
        <div className={styles.rightSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName} 님</span>
            <span className={styles.userRole}>({roleLabel})</span>
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

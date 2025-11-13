/**
 * Header Component
 * - 상단 헤더 (Vision Pro 스타일)
 * - 로고, 앱 이름, 사용자 정보, 알림 배지
 */

import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './Header.module.scss'

/**
 * 상단 헤더 컴포넌트
 * @param {string} userName - 사용자 이름
 * @param {string} userRole - 사용자 역할 (시니어, 보호자)
 * @param {number} notificationCount - 알림 개수
 * @returns {JSX.Element} 헤더 컴포넌트
 */
export const Header = ({ userName = '사용자', userRole = '시니어', notificationCount = 0 }) => {
  const navigate = useNavigate()

  const handleNotificationClick = () => {
    navigate(ROUTE_PATHS.notifications)
  }

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
            <span className={styles.userRole}>({userRole})</span>
          </div>

          {notificationCount > 0 && (
            <button
              type="button"
              className={styles.notificationBadge}
              onClick={handleNotificationClick}
              aria-label="알림"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

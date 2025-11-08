/**
 * MainLayout Component
 * - 전체 페이지 레이아웃 (헤더 + 콘텐츠 + 하단 메뉴)
 */

import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'
import styles from './MainLayout.module.css'

/**
 * 메인 레이아웃 컴포넌트
 * @param {React.ReactNode} children - 메인 콘텐츠
 * @param {string} userName - 사용자 이름
 * @param {string} userRole - 사용자 역할
 * @param {number} notificationCount - 알림 개수
 * @returns {JSX.Element} 레이아웃 컴포넌트
 */
export const MainLayout = ({
  children,
  userName = '사용자',
  userRole = '시니어',
  notificationCount = 0
}) => {
  return (
    <div className={styles.layoutContainer}>
      <Header
        userName={userName}
        userRole={userRole}
        notificationCount={notificationCount}
      />

      <main className={styles.mainContent}>
        {children}
      </main>

      <BottomNavigation />
    </div>
  )
}

export default MainLayout

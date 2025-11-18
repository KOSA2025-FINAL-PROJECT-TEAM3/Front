/**
 * MainLayout Component
 * - 전체 페이지 레이아웃 (헤더 + 콘텐츠 + 하단 메뉴)
 * - Header가 자동으로 사용자 정보와 알림을 가져옴
 */

import classNames from 'classnames'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'
import styles from './MainLayout.module.scss'

/**
 * 메인 레이아웃 컴포넌트
 * @param {React.ReactNode} children - 메인 콘텐츠
 * @param {boolean} showBottomNav - 하단 네비게이션 표시 여부
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 레이아웃 컴포넌트
 */
export const MainLayout = ({ children, showBottomNav = true, className }) => {
  return (
    <div className={classNames(styles.layoutContainer, className)}>
      <Header />

      <main className={styles.mainContent}>{children}</main>

      {showBottomNav && <BottomNavigation />}
    </div>
  )
}

export default MainLayout

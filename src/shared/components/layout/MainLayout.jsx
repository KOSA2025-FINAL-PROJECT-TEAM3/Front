/**
 * MainLayout Component
 * - 전체 페이지 레이아웃 (헤더 + 콘텐츠 + 하단 메뉴)
 * - Header가 자동으로 사용자 정보와 알림을 가져옴
 */

import { useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { Header } from './Header'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { VoiceAssistant } from '@features/voice/components/VoiceAssistant'
import { useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { AdaptiveNavigation } from './AdaptiveNavigation'
import { getPrimaryNavItems } from './primaryNavItems'
import styles from './MainLayout.module.scss'

/**
 * 메인 레이아웃 컴포넌트
 * @param {React.ReactNode} children - 메인 콘텐츠
 * @param {boolean} showBottomNav - 하단 네비게이션 표시 여부
 * @param {boolean} fullScreen - (New) 여백 없이 화면 꽉 채우기 모드 (채팅방용)
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 레이아웃 컴포넌트
 */
export const MainLayout = ({ children, showBottomNav = true, fullScreen = false, className }) => {
  const location = useLocation()
  const { isAuthenticated, customerRole } = useAuth((state) => ({
    isAuthenticated: state.isAuthenticated,
    customerRole: state.customerRole,
  }))
  const { fetchNotifications } = useNotificationStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated, fetchNotifications])

  const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
  const navItems = useMemo(() => getPrimaryNavItems({ roleKey }), [roleKey])

  const shouldHideVoiceAssistant =
    fullScreen ||
    location.pathname === ROUTE_PATHS.ocrScan ||
    location.pathname.startsWith(ROUTE_PATHS.ocrScan + '/') ||
    location.pathname === ROUTE_PATHS.dietLog ||
    location.pathname.startsWith(ROUTE_PATHS.dietLog + '/')

  const showVoiceAssistant = !shouldHideVoiceAssistant

  return (
    <div className={classNames(styles.layoutContainer, className)}>
      <Header />

      {/* fullScreen일 경우 mainContent의 기본 스타일을 덮어쓰거나 다른 클래스 적용 */}
      <div className={styles.body}>
        {showBottomNav && (
          <nav aria-label="주요 내비게이션">
            <AdaptiveNavigation items={navItems} position="bottom" />
          </nav>
        )}

        <main
          className={classNames(
            styles.mainContent,
            { [styles.fullScreenMode]: fullScreen },
            { [styles.withBottomNav]: showBottomNav }
          )}
        >
          {children}
        </main>
      </div>

      {showVoiceAssistant && <VoiceAssistant />}
    </div>
  )
}

export default MainLayout

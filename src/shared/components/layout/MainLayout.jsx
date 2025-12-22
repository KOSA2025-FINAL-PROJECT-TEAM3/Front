/**
 * MainLayout Component (Compat)
 * - 기존 import 경로 호환을 위해 유지
 * - 실제 레이아웃 책임은 AppShell로 이동
 */

import AppShell from './AppShell'

/**
 * 메인 레이아웃 컴포넌트
 * @param {React.ReactNode} children - 메인 콘텐츠
 * @param {boolean} showBottomNav - 하단 네비게이션 표시 여부
 * @param {boolean} fullScreen - (New) 여백 없이 화면 꽉 채우기 모드 (채팅방용)
 * @param {boolean} hideHeader - 기본 헤더 숨김 (커스텀 헤더 사용 시)
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 레이아웃 컴포넌트
 */
export const MainLayout = ({ children, showBottomNav = true, fullScreen = false, hideHeader = false, className }) => {
  return (
    <AppShell showBottomNav={showBottomNav} fullScreen={fullScreen} hideHeader={hideHeader} className={className}>
      {children}
    </AppShell>
  )
}

export default MainLayout

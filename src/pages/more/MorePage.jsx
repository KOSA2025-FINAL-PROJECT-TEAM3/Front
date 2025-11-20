/**
 * More Page
 * - 더보기 메뉴 페이지
 * - 그룹화된 메뉴로 모든 기능 접근
 */

import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MenuGroup } from '@shared/components/ui/MenuGroup'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { isCaregiverRole } from '@features/auth/utils/roleUtils'
import styles from './MorePage.module.scss'

export const MorePage = () => {
  const navigate = useNavigate()
  const { customerRole, logout } = useAuth((state) => ({
    customerRole: state.customerRole,
    logout: state.logout,
  }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  const isCaregiver = isCaregiverRole(customerRole)

  const handleNavigate = (path) => {
    if (!path) return
    navigate(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  // 알림 및 리포트 그룹
  const notificationReportItems = [
    {
      id: 'notifications',
      label: '알림',
      icon: '🔔',
      description: '복약 알림 · 가족 알림',
      onClick: () => handleNavigate(ROUTE_PATHS.notifications),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    isCaregiver && {
      id: 'adherenceReport',
      label: '복약 리포트',
      icon: '📊',
      description: '복약 이행률 · 통계',
      onClick: () => handleNavigate(ROUTE_PATHS.adherenceReport),
    },
    isCaregiver && {
      id: 'weeklyStats',
      label: '주간 통계',
      icon: '📈',
      description: '주간 복약 현황',
      onClick: () => handleNavigate(ROUTE_PATHS.weeklyStats),
    },
  ].filter(Boolean)

  // 건강 관리 그룹
  const healthManagementItems = [
    {
      id: 'ocrScan',
      label: '처방전 스캔',
      icon: '📸',
      description: 'OCR로 처방전 자동 등록',
      onClick: () => handleNavigate(ROUTE_PATHS.ocrScan),
    },
    {
      id: 'counsel',
      label: '의사 상담',
      icon: '💬',
      description: '온라인 의료 상담',
      onClick: () => handleNavigate(ROUTE_PATHS.counsel),
    },
    {
      id: 'disease',
      label: '질환 관리',
      icon: '📋',
      description: '진단 정보 · 주의 식품',
      onClick: () => handleNavigate(ROUTE_PATHS.disease),
    },
  ]

  // 식단 관리 그룹
  const dietManagementItems = [
    {
      id: 'dietWarning',
      label: '식이 경고',
      icon: '⚠️',
      description: '약-음식 상호작용 경고',
      onClick: () => handleNavigate(ROUTE_PATHS.dietWarning),
    },
    {
      id: 'dietLog',
      label: '식단 기록',
      icon: '🍽️',
      description: '식사 기록 · 관리',
      onClick: () => handleNavigate(ROUTE_PATHS.dietLog),
    },
  ]

  // 계정 관리 그룹
  const accountItems = [
    {
      id: 'settings',
      label: '설정',
      icon: '⚙️',
      description: '프로필 · 알림 · 개인정보',
      onClick: () => handleNavigate(ROUTE_PATHS.settings),
    },
    {
      id: 'logout',
      label: '로그아웃',
      icon: '⎋',
      description: '현재 계정에서 로그아웃',
      onClick: handleLogout,
    },
  ]

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>더보기</h1>
          <p>모든 기능과 설정을 확인하세요</p>
        </header>

        <div className={styles.content}>
          <MenuGroup title="알림 및 리포트" items={notificationReportItems} />
          <MenuGroup title="건강 관리" items={healthManagementItems} />
          <MenuGroup title="식단 관리" items={dietManagementItems} />
          <MenuGroup title="계정" items={accountItems} />
        </div>
      </div>
    </MainLayout>
  )
}

export default MorePage

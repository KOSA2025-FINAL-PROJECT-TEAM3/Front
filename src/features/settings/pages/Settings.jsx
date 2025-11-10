import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { ProfileSection } from '../components/ProfileSection.jsx'
import { SettingsMenu } from '../components/SettingsMenu.jsx'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './Settings.module.scss'

const menuDefinitions = [
  {
    id: 'profile',
    label: '프로필 편집',
    icon: '👤',
    description: '기본 정보 · 연락처 설정',
    path: ROUTE_PATHS.settingsProfile,
  },
  {
    id: 'notifications',
    label: '알림 설정',
    icon: '🔔',
    description: '푸시 · 이메일 알림 토글',
    path: ROUTE_PATHS.settingsNotifications,
  },
  {
    id: 'medications',
    label: '약 관리',
    icon: '💊',
    description: '약 목록 · 일정 확인',
    path: ROUTE_PATHS.medication,
  },
  {
    id: 'diseases',
    label: '질병 관리',
    icon: '📋',
    description: '진단 정보 · 주의 식품',
    path: ROUTE_PATHS.disease,
  },
  {
    id: 'privacy',
    label: '개인정보 처리방침',
    icon: '🔒',
    path: '/docs/privacy',
  },
  {
    id: 'terms',
    label: '이용약관',
    icon: '📜',
    path: '/docs/terms',
  },
]

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth((state) => ({ user: state.user, logout: state.logout }))

  const handleNavigate = (path) => {
    if (!path) return
    navigate(path)
  }

  const items = [
    ...menuDefinitions.map((item) => ({ ...item, onClick: () => handleNavigate(item.path) })),
    {
      id: 'logout',
      label: '로그아웃',
      icon: '⎋',
      description: '현재 계정에서 로그아웃',
      onClick: async () => {
        await logout()
        navigate(ROUTE_PATHS.login, { replace: true })
      },
    },
  ]

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>설정</h1>
            <p>계정 · 알림 · 개인정보 설정을 관리하세요.</p>
          </div>
        </header>

        <ProfileSection user={user} />

        <SettingsMenu items={items} />
      </div>
    </MainLayout>
  )
}

export default SettingsPage

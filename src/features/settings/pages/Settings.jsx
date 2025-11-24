import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { ProfileSection } from '../components/ProfileSection.jsx'
import { SettingsMenu } from '../components/SettingsMenu.jsx'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import { SETTINGS_MENU_DEFINITIONS } from '@/data/mockUiConstants'
import styles from './Settings.module.scss'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth((state) => ({ user: state.user, logout: state.logout }))

  const handleNavigate = (path) => {
    if (!path) return
    navigate(path)
  }

  const items = [
    ...SETTINGS_MENU_DEFINITIONS.map((item) => ({ ...item, onClick: () => handleNavigate(item.path) })),
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

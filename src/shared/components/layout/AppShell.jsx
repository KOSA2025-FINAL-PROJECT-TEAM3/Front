/**
 * AppShell Component
 * - 앱 공통 레이아웃 책임 분리(헤더/내비/콘텐츠/VoiceAssistant)
 * - 기존 MainLayout에서 사용하던 동작을 그대로 유지
 */

import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { USER_ROLES } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'

import { Header } from './Header'
import { AdaptiveNavigation } from './AdaptiveNavigation'
import { getPrimaryNavItems } from './primaryNavItems'
import { VoiceAssistant } from '@features/voice/components/VoiceAssistant'
import { useFocusModeStore } from '@shared/stores/focusModeStore'

export const AppShell = ({
  children,
  showBottomNav = true,
  fullScreen = false,
  className,
}) => {
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

  const focusModeActive = useFocusModeStore((state) => Object.keys(state.activeKeys || {}).length > 0)

  const shouldHideVoiceAssistant =
    focusModeActive ||
    fullScreen ||
    location.pathname === ROUTE_PATHS.ocrScan ||
    location.pathname.startsWith(ROUTE_PATHS.ocrScan + '/') ||
    location.pathname === ROUTE_PATHS.dietLog ||
    location.pathname.startsWith(ROUTE_PATHS.dietLog + '/')

  const showVoiceAssistant = !shouldHideVoiceAssistant

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)',
        overflow: 'hidden',
      }}
    >
      <Header />

      <Box sx={{ display: 'flex', flex: 1, pt: '60px', overflow: 'hidden' }}>
        {showBottomNav && (
          <nav aria-label="주요 내비게이션">
            <AdaptiveNavigation items={navItems} position="bottom" />
          </nav>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: fullScreen ? 'hidden' : 'auto',
            px: fullScreen ? 0 : { xs: 2, md: 2.5 },
            py: fullScreen ? 0 : { xs: 2, md: 2.5 },
            width: '100%',
            maxWidth: fullScreen ? 'none' : 1400,
            mx: 'auto',
            pb: fullScreen ? 0 : showBottomNav ? '96px' : 0,
            display: fullScreen ? 'flex' : 'block',
            flexDirection: fullScreen ? 'column' : undefined,
          }}
        >
          {children}
        </Box>
      </Box>

      {showVoiceAssistant && <VoiceAssistant />}
    </Box>
  )
}

export default AppShell

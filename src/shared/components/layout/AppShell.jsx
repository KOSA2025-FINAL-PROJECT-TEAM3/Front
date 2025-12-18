/**
 * AppShell Component
 * - 앱 공통 레이아웃 책임 분리(헤더/내비/콘텐츠/VoiceAssistant)
 * - 기존 MainLayout에서 사용하던 동작을 그대로 유지
 */

import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { USER_ROLES } from '@config/constants'

import { Header } from './Header'
import { AdaptiveNavigation } from './AdaptiveNavigation'
import { getPrimaryNavItems } from './primaryNavItems'
import { useFocusModeStore } from '@shared/stores/focusModeStore'
import FloatingActionButtons from './FloatingActionButtons'
import SearchOverlay from '@features/search/components/SearchOverlay'
import { shouldHideFloatingActions } from './floatingActionsVisibility'

export const AppShell = ({
  children,
  showBottomNav = true,
  fullScreen = false,
  className,
}) => {
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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

  const hideFloatingActions = shouldHideFloatingActions({
    pathname: location.pathname,
    focusModeActive,
    fullScreen,
  })

  const showMobileBottomNav = Boolean(showBottomNav && isMobile)

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Header navItems={navItems} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          pt: {
            xs: 'calc(64px + var(--safe-area-top))',
            md: 'calc(72px + var(--safe-area-top))',
          },
          overflow: 'hidden',
        }}
      >
        {showMobileBottomNav && (
          <nav aria-label="주요 내비게이션">
            <AdaptiveNavigation items={navItems} position="bottom" />
          </nav>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: fullScreen ? 'hidden' : 'auto',
            px: fullScreen ? 0 : { xs: 2.5, md: 4 },
            pt: fullScreen ? 0 : { xs: 2.5, md: 4 },
            pb: fullScreen
              ? 0
              : showMobileBottomNav
                ? { xs: 'calc(var(--bottom-dock-height) + var(--safe-area-bottom) + 32px)', md: 4 }
                : { xs: 2.5, md: 4 },
            width: '100%',
            maxWidth: fullScreen ? 'none' : { xs: '100%', md: 1280 },
            mx: 'auto',
            display: fullScreen ? 'flex' : 'block',
            flexDirection: fullScreen ? 'column' : undefined,
          }}
        >
          {children}
        </Box>
      </Box>

      <SearchOverlay />
      {!hideFloatingActions && <FloatingActionButtons hasBottomDock={showMobileBottomNav} />}
    </Box>
  )
}

export default AppShell

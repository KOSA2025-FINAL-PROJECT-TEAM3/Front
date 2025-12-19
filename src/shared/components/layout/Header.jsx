/**
 * Header Component
 * - 상단 헤더 (Vision Pro 스타일)
 * - 로고, 앱 이름, 사용자 정보, 알림 배지
 * - 자동으로 auth store와 notification store에서 데이터 가져옴
 */

import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Badge, Box, Button, IconButton, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { getCustomerRoleLabel } from '@features/auth/utils/roleUtils'
import AppConfirmDialog from '@shared/components/mui/AppConfirmDialog'

/**
 * 상단 헤더 컴포넌트
 * @returns {JSX.Element} 헤더 컴포넌트
 */
export const Header = ({ navItems = [] }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, customerRole, logout } = useAuth((state) => ({
    user: state.user,
    customerRole: state.customerRole,
    logout: state.logout,
  }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const activeNavPath = useMemo(() => {
    if (!navItems?.length) return ''
    const pathname = location.pathname || ''
    const matched = navItems.find((item) => {
      if (!item?.path) return false
      return pathname === item.path || pathname.startsWith(item.path + '/')
    })

    return matched?.path || navItems[0].path
  }, [location.pathname, navItems])

  const handleNotificationClick = () => {
    navigate(ROUTE_PATHS.notifications)
  }

  const handleMoreClick = () => {
    navigate(ROUTE_PATHS.more)
  }

  const confirmLogout = async () => {
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
    setLogoutDialogOpen(false)
  }

  const hasMoreNav = useMemo(
    () => navItems.some((item) => item?.path === ROUTE_PATHS.more),
    [navItems],
  )

  // 사용자 이름 가져오기
  const userName = user?.name || user?.email?.split('@')[0] || '사용자'

  // 역할 라벨
  const roleLabel = getCustomerRoleLabel(customerRole)

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: {
            xs: 'calc(64px + var(--safe-area-top))',
            md: 'calc(72px + var(--safe-area-top))',
          },
          pt: 'var(--safe-area-top)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          color: 'text.primary',
          zIndex: 101,
          boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            height: { xs: 64, md: 72 },
            px: { xs: 2.5, md: 3 },
            width: '100%',
            maxWidth: 1400,
            mx: 'auto',
            position: 'relative',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => navigate(ROUTE_PATHS.root)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(ROUTE_PATHS.root)
              }
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Box aria-hidden sx={{ fontSize: { xs: 24, md: 32 }, display: 'flex', alignItems: 'center' }}>
              💊
            </Box>
            <Typography sx={{ fontSize: { xs: 18, md: 24 }, fontWeight: 900, letterSpacing: -0.5 }}>
              뭐냑? (AMA...Pill)
            </Typography>
          </Stack>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 2 }}>
            {navItems?.length > 0 && (
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  sx={{
                    bgcolor: '#F1F5F9',
                    p: 0.5,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)',
                  }}
                >
                  <Tabs
                    value={activeNavPath}
                    onChange={(_, next) => navigate(next)}
                    variant="standard"
                    TabIndicatorProps={{ style: { display: 'none' } }}
                    sx={{
                      minHeight: 40,
                      '& .MuiTabs-flexContainer': { gap: 0.5 },
                    }}
                  >
                    {navItems.map((item) => (
                      <Tab
                        key={item.path}
                        label={item.label}
                        value={item.path}
                        disableRipple
                        sx={{
                          minHeight: 40,
                          minWidth: 88,
                          px: 2,
                          py: 0.5,
                          borderRadius: 999,
                          textTransform: 'none',
                          fontWeight: 900,
                          color: 'text.secondary',
                          '&.Mui-selected': {
                            bgcolor: 'common.white',
                            color: 'primary.main',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          },
                        }}
                      />
                    ))}
                  </Tabs>
                </Box>
              </Box>
            )}
          </Box>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, md: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, md: 1 }}
              onClick={() => navigate(ROUTE_PATHS.settings)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(ROUTE_PATHS.settings)
                }
              }}
              sx={{ cursor: 'pointer', maxWidth: { xs: 100, md: 'none' } }}
            >
              <Typography 
                sx={{ 
                  fontSize: { xs: 11, md: 14 }, 
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 60, md: 'none' }
                }}
              >
                {userName} 님
              </Typography>
              <Typography sx={{ fontSize: { xs: 10, md: 12 }, color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
                ({roleLabel})
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setLogoutDialogOpen(true)
              }}
              sx={{ 
                borderRadius: 999, 
                fontWeight: 800,
                minWidth: { xs: 28, md: 'auto' },
                px: { xs: 0.75, md: 2 },
                py: { xs: 0.25, md: 0.5 },
                fontSize: { xs: 10, md: 14 }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>로그아웃</Box>
              <Box component="span" sx={{ display: { xs: 'inline', md: 'none' }, fontSize: 12 }}>⎋</Box>
            </Button>

            <IconButton
              onClick={handleNotificationClick}
              aria-label={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '알림'}
              sx={{
                width: { xs: 24, md: 28 },
                height: { xs: 24, md: 28 },
                bgcolor: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                color: 'common.white',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                '&:hover': { bgcolor: 'transparent', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)' },
              }}
            >
              <Badge
                color="error"
                overlap="circular"
                badgeContent={unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null}
              >
                <NotificationsIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
              </Badge>
            </IconButton>

            {!hasMoreNav ? (
              <IconButton
                onClick={handleMoreClick}
                aria-label="더보기"
                sx={{
                  width: { xs: 24, md: 28 },
                  height: { xs: 24, md: 28 },
                  bgcolor: 'rgba(0, 0, 0, 0.06)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' },
                }}
              >
                <MoreHorizIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
              </IconButton>
            ) : null}
          </Stack>
        </Toolbar>
      </AppBar>
      <AppConfirmDialog
        open={logoutDialogOpen}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
        confirmLabel="로그아웃"
      />
    </>
  )
}

export default Header

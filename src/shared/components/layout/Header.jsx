/**
 * Header Component
 * - 상단 헤더 (Vision Pro 스타일)
 * - 로고, 앱 이름, 사용자 정보, 알림 배지
 * - 자동으로 auth store와 notification store에서 데이터 가져옴
 */

import { useNavigate } from 'react-router-dom'
import { AppBar, Badge, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { getCustomerRoleLabel } from '@features/auth/utils/roleUtils'

/**
 * 상단 헤더 컴포넌트
 * @returns {JSX.Element} 헤더 컴포넌트
 */
export const Header = () => {
  const navigate = useNavigate()
  const { user, customerRole, logout } = useAuth((state) => ({
    user: state.user,
    customerRole: state.customerRole,
    logout: state.logout,
  }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  const handleNotificationClick = () => {
    navigate(ROUTE_PATHS.notifications)
  }

  const handleMoreClick = () => {
    navigate(ROUTE_PATHS.more)
  }

  // 사용자 이름 가져오기
  const userName = user?.name || user?.email?.split('@')[0] || '사용자'

  // 역할 라벨
  const roleLabel = getCustomerRoleLabel(customerRole)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 60,
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderBottomColor: 'rgba(200, 200, 200, 0.2)',
        color: 'text.primary',
        zIndex: 101,
      }}
    >
      <Toolbar sx={{ height: 60, px: { xs: 2, md: 7.5 }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
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

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 1.25, md: 2.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={() => navigate(ROUTE_PATHS.settingsProfile)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(ROUTE_PATHS.settingsProfile)
              }
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Typography sx={{ fontSize: { xs: 12, md: 14 }, fontWeight: 800 }}>
              {userName} 님
            </Typography>
            <Typography sx={{ fontSize: { xs: 10, md: 12 }, color: 'text.secondary' }}>
              ({roleLabel})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={async (e) => {
                e.stopPropagation()
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  await logout()
                  navigate(ROUTE_PATHS.login, { replace: true })
                }
              }}
              sx={{ borderRadius: 999, fontWeight: 800 }}
            >
              로그아웃
            </Button>
          </Stack>

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
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Header

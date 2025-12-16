import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { AccessibilitySection } from '../components/AccessibilitySection.jsx'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'
import { SETTINGS_MENU_DEFINITIONS } from '@/constants/uiConstants'
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

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

  const initials = user?.name?.[0] ?? user?.email?.[0] ?? '?'

  return (
    <MainLayout>
      <Box sx={{ pb: 2 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={800}>
              설정
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              계정 · 알림 · 개인정보 설정을 관리하세요.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 44, height: 44, fontWeight: 800 }}>{initials}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} noWrap>
                  {user?.name || '게스트'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email || '로그인이 필요합니다'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <AccessibilitySection />

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <List disablePadding>
              {items.map((item, index) => (
                <Box key={item.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItemButton onClick={item.onClick}>
                    <ListItemIcon sx={{ minWidth: 40, fontSize: 22 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 700 }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                    <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
                  </ListItemButton>
                </Box>
              ))}
            </List>
          </Paper>
        </Stack>
      </Box>
    </MainLayout>
  )
}

export default SettingsPage

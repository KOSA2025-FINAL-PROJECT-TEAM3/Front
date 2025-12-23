/**
 * More Page
 * - 더보기 메뉴 페이지
 * - 그룹화된 메뉴로 모든 기능 접근
 */

import { useNavigate } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { isCaregiverRole } from '@features/auth/utils/roleUtils'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'

const MenuSection = ({ title, items = [] }) => {
  if (!items.length) return null

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <List
        disablePadding
        subheader={
          <ListSubheader component="div">
            {title}
          </ListSubheader>
        }
      >
        {items.map((item, index) => {
          const iconNode =
            typeof item.icon === 'string' ? (
              <Box component="span" sx={{ fontSize: 20 }}>
                {item.icon}
              </Box>
            ) : (
              item.icon
            )

          return (
            <Box key={item.id}>
              <ListItemButton
                onClick={item.onClick}
                disabled={item.disabled}
                sx={{ py: 1.25 }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  {iconNode}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
                {item.badge !== undefined && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                )}
                <ChevronRightIcon color="action" />
              </ListItemButton>
              {index < items.length - 1 && <Divider />}
            </Box>
          )
        })}
      </List>
    </Paper>
  )
}

export const MorePage = () => {
  const navigate = useNavigate()
  const { customerRole, logout } = useAuth((state) => ({
    customerRole: state.customerRole,
    logout: state.logout,
  }))
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)

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
    {
      id: 'adherenceReport',
      label: '복약 리포트',
      icon: '📊',
      description: '복약 이행률 · 통계',
      onClick: () => handleNavigate(ROUTE_PATHS.adherenceReport),
    },
    {
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
      id: 'searchOverlay',
      label: '통합 검색',
      icon: '🔍',
      description: '증상 · 알약 검색',
      onClick: () => openSearchOverlay('pill'),
    },
    {
      id: 'medication',
      label: '약 관리',
      icon: '💊',
      description: '처방전 목록 · 약 등록',
      onClick: () => handleNavigate(ROUTE_PATHS.medication),
    },
    {
      id: 'medicationToday',
      label: '오늘 복약',
      icon: '⏰',
      description: '오늘 복약 체크 · 기록',
      onClick: () => handleNavigate(ROUTE_PATHS.medicationToday),
    },
    {
      id: 'ocrScan',
      label: '처방전 스캔',
      icon: '📸',
      description: 'OCR로 처방전 자동 등록',
      onClick: () => handleNavigate(ROUTE_PATHS.ocrScan),
    },
    {
      id: 'places',
      label: '병원/약국 검색',
      icon: '🗺️',
      description: '지도 기반 검색',
      onClick: () => handleNavigate(ROUTE_PATHS.places),
    },
    {
      id: 'appointments',
      label: '진료 일정',
      icon: '🏥',
      description: '진료 일정 관리 · 리마인더',
      onClick: () => handleNavigate(ROUTE_PATHS.appointments),
    },
    {
      id: 'disease',
      label: '질환 관리',
      icon: '📋',
      description: '진단 정보 · 주의 식품',
      onClick: () => handleNavigate(ROUTE_PATHS.disease),
    },
  ]

  // 가족 관리 그룹
  const familyManagementItems = [
    {
      id: 'familyChat',
      label: '가족 채팅',
      icon: '💬',
      description: '가족과 대화',
      onClick: () => handleNavigate(ROUTE_PATHS.familyChat),
    },
    {
      id: 'inviteCodeEntry',
      label: '초대 코드 입력',
      icon: '🎫',
      description: '가족 초대 코드로 그룹 합류',
      onClick: () => handleNavigate(ROUTE_PATHS.inviteCodeEntry),
    },
    isCaregiver && {
      id: 'family',
      label: '가족 관리',
      icon: '👨‍👩‍👧‍👦',
      description: '가족 구성원 관리',
      onClick: () => handleNavigate(ROUTE_PATHS.family),
    },
    isCaregiver && {
      id: 'familyInvite',
      label: '가족 초대',
      icon: '✉️',
      description: '새 가족 구성원 초대',
      onClick: () => handleNavigate(ROUTE_PATHS.familyInvite),
    },
  ].filter(Boolean)

  // 식단 관리 그룹
  const dietManagementItems = [
    {
      id: 'dietWarning',
      label: '식단 히스토리',
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
      <PageStack>
        <PageHeader leading={<BackButton />} title="더보기" subtitle="모든 기능과 설정을 확인하세요" />

        <Stack spacing={2}>
          <MenuSection title="알림 및 리포트" items={notificationReportItems} />
          <MenuSection title="가족 관리" items={familyManagementItems} />
          <MenuSection title="건강 관리" items={healthManagementItems} />
          <MenuSection title="식단 관리" items={dietManagementItems} />
          <MenuSection title="계정" items={accountItems} />
        </Stack>
      </PageStack>
    </MainLayout>
  )
}

export default MorePage

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Badge,
  ButtonBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import MicIcon from '@mui/icons-material/Mic'
import RemoveIcon from '@mui/icons-material/Remove'
import GroupIcon from '@mui/icons-material/Group'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ChatIcon from '@mui/icons-material/Chat'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { ROUTE_PATHS } from '@config/routes.config'
import { useUiPreferencesStore } from '@shared/stores/uiPreferencesStore'
import { useVoiceRecognition } from '@features/voice/hooks/useVoiceRecognition'
import { useVoiceStore } from '@features/voice/stores/voiceStore'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { USER_ROLES } from '@config/constants'
import { useCareTargetStore } from '@features/dashboard/store/careTargetStore'
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'
import { DietEntryModal } from '@features/diet/components/DietEntryModal'
import { MedicationEntryModal } from '@features/medication/components/MedicationEntryModal'
import { DiseaseEntryModal } from '@features/disease/components/DiseaseEntryModal'
import { OcrEntryModal } from '@features/ocr/components/OcrEntryModal'
import { useFamilyStore } from '@features/family/store/familyStore'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'
import { useNotificationStore } from '@features/notification/store/notificationStore'

export const FloatingActionButtons = ({ hasBottomDock = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'diet', 'medication', 'disease', 'ocr'

  const { fontScaleLevel, increaseFontScaleLevel, decreaseFontScaleLevel } = useUiPreferencesStore((state) => ({
    fontScaleLevel: state.fontScaleLevel,
    increaseFontScaleLevel: state.increaseFontScaleLevel,
    decreaseFontScaleLevel: state.decreaseFontScaleLevel,
  }))

  // Dashboard에서 선택된 시니어 ID를 가져옴 (useCareTargetStore 사용)
  const activeSeniorId = useCareTargetStore((state) => state.activeSeniorMemberId)

  const { customerRole, user } = useAuth((state) => ({ customerRole: state.customerRole, user: state.user }))

  // Default to CAREGIVER if role is unknown/loading
  // This prevents Caregivers from seeing Senior FAB (SOS button) momentarily
  const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.CAREGIVER
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)
  const { unreadCount } = useNotificationStore((state) => ({
    unreadCount: state.unreadCount,
  }))

  const { isListening, toggleVoice } = useVoiceRecognition()
  const { transcript, feedbackMessage } = useVoiceStore()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const bottom = hasBottomDock
    ? 'calc(var(--bottom-dock-height) + var(--safe-area-bottom) + 24px)'
    : 'calc(var(--safe-area-bottom) + 24px)'

  const handleExportPdf = async () => {
    const userId = user?.id || user?.userId
    if (!userId) {
      toast.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    try {
      const blob = await diseaseApiClient.exportPdf(userId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diseases.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF 다운로드를 시작합니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    }
  }

  // 🎮 Game-feel: Haptic feedback helper
  const triggerHaptic = (duration = 50) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration)
    }
  }

  // Common Actions removed as they are now explicit per role

  // Helper to determine target user (Senior or Caregiver)
  // Use reactive state for familyGroups to ensure we have data
  const { familyGroups, familyMembers } = useFamilyStore((state) => ({
    familyGroups: state.familyGroups,
    familyMembers: state.members,
  }))

  const findMemberById = (members, targetId) => {
    if (!Array.isArray(members)) return null
    return members.find(
      (member) => String(member.id) === String(targetId) || String(member.userId) === String(targetId),
    )
  }

  const resolveMemberByActiveId = () => {
    if (!activeSeniorId) return null

    if (familyGroups && familyGroups.length > 0) {
      for (const group of familyGroups) {
        if (!group.members) continue
        const member = findMemberById(group.members, activeSeniorId)
        if (member) return member
      }
    }

    return findMemberById(familyMembers, activeSeniorId)
  }

  const resolveCareTargetUser = () => {
    const member = resolveMemberByActiveId()
    if (!member || member.userId == null) return null
    return { id: member.userId, name: member.nickname || member.name || '어르신' }
  }

  const ensureCareTarget = () => {
    const target = resolveCareTargetUser()
    if (!target?.id) {
      toast.warning('등록할 어르신을 먼저 선택해주세요.')
      return null
    }
    return target
  }

  const getActiveTarget = () => {
    if (activeSeniorId) {
      const resolvedMember = resolveMemberByActiveId()
      if (resolvedMember) {
        return { id: resolvedMember.userId ?? resolvedMember.id, name: resolvedMember.nickname || resolvedMember.name }
      }

      // 2. Fallback
      return { id: activeSeniorId, name: '어르신' }
    }
    // Default to caregiver if no senior selected
    return { id: user?.id || user?.userId, name: user?.name }
  }

  // Caregiver Specific Actions
  const caregiverActions = [
    {
      id: 'search',
      label: '통합 검색',
      icon: <SearchIcon fontSize="small" />,
      color: { bg: '#ECFDF5', fg: '#10B981' },
      onClick: () => {
        const target = getActiveTarget()
        openSearchOverlay('pill', { targetUserId: target.id, targetUserName: target.name })
      },
    },
    {
      id: 'places',
      label: '병원 검색',
      icon: <LocalHospitalIcon fontSize="small" />,
      color: { bg: '#FEE2E2', fg: '#EF4444' },
      onClick: () => {
        const target = getActiveTarget()
        openSearchOverlay('hospital', { targetUserId: target.id, targetUserName: target.name })
      },
    },
    {
      id: 'family',
      label: '가족 관리',
      icon: <ManageAccountsIcon fontSize="small" />,
      color: { bg: '#F1F5F9', fg: '#475569' },
      onClick: () => navigate(ROUTE_PATHS.family),
    },
    {
      id: 'chat',
      label: '가족 채팅',
      icon: <ChatIcon fontSize="small" />,
      color: { bg: '#FFFBEB', fg: '#F59E0B' },
      onClick: () => navigate(ROUTE_PATHS.familyChat),
    },
    {
      id: 'invite',
      label: '가족 초대',
      icon: <GroupIcon fontSize="small" />,
      color: { bg: '#EEF2FF', fg: '#6366F1' },
      onClick: () => navigate(ROUTE_PATHS.familyInvite),
    },
    {
      id: 'medication',
      label: '약 등록',
      icon: <LocalPharmacyIcon fontSize="small" />,
      color: { bg: '#EFF6FF', fg: '#3B82F6' },
      onClick: () => {
        if (!ensureCareTarget()) return
        setActiveModal('medication')
      },
    },
    {
      id: 'disease',
      label: '질병 등록',
      icon: <HealthAndSafetyIcon fontSize="small" />,
      color: { bg: '#FEF2F2', fg: '#EF4444' },
      onClick: () => {
        if (!ensureCareTarget()) return
        setActiveModal('disease')
      },
    },
    {
      id: 'ocr',
      label: 'OCR 약봉투',
      icon: <CameraAltIcon fontSize="small" />,
      color: { bg: '#F0FDFA', fg: '#2EC4B6' },
      onClick: () => {
        if (!ensureCareTarget()) return
        setActiveModal('ocr')
      },
    },
  ]

  // Senior Specific Actions
  const seniorActions = [
    {
      id: 'ocr',
      label: '처방전 촬영',
      icon: <CameraAltIcon fontSize="small" />,
      color: { bg: '#EEF2FF', fg: '#6366F1' },
      onClick: () => {
        setActiveModal('ocr')
      },
    },
    {
      id: 'diet',
      label: '식단 기록',
      icon: <RestaurantIcon fontSize="small" />,
      color: { bg: '#F0FDFA', fg: '#2EC4B6' },
      onClick: () => setActiveModal('diet'),
    },
    {
      id: 'disease',
      label: '질병 리포트',
      icon: <HealthAndSafetyIcon fontSize="small" />,
      color: { bg: '#FFFBEB', fg: '#F59E0B' },
      onClick: () => navigate(ROUTE_PATHS.disease),
    },
    {
      id: 'pdf_export',
      label: 'PDF 출력',
      icon: <PictureAsPdfIcon fontSize="small" />,
      color: { bg: '#FEE2E2', fg: '#EF4444' },
      onClick: handleExportPdf,
    },
    {
      id: 'medication_log',
      label: '복용 기록',
      icon: <LocalPharmacyIcon fontSize="small" />,
      color: { bg: '#EFF6FF', fg: '#3B82F6' },
      onClick: () => navigate(ROUTE_PATHS.medicationToday),
    },
    // Senior can also have chat if needed, but per request consolidating mainly these 3 + Mic + Notification
  ]

  const menuItems = (isCaregiver ? caregiverActions : seniorActions).filter((item) => !item.hidden)

  const fontLabel = fontScaleLevel === 1 ? '표준' : fontScaleLevel === 2 ? '크게' : '더크게'
  const modalTarget = isCaregiver
    ? resolveCareTargetUser()
    : { id: user?.id || user?.userId, name: user?.name }

  return (
    <>
      {menuOpen ? (
        <Box
          onClick={() => setMenuOpen(false)}
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 2000,
          }}
        />
      ) : null}

      {isListening ? (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'common.white',
            pointerEvents: 'none',
          }}
        >
          <Paper
            sx={{
              pointerEvents: 'none',
              bgcolor: 'common.white',
              color: 'text.primary',
              px: 3.5,
              py: 2.5,
              borderRadius: 4,
              textAlign: 'center',
              minWidth: 300,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              mb: 15,
            }}
          >
            <Typography variant="subtitle1" sx={{ m: 0, mb: 1, color: 'text.secondary', fontWeight: 800 }}>
              {feedbackMessage || '말씀해주세요...'}
            </Typography>
            <Typography variant="h5" sx={{ m: 0, fontWeight: 900 }}>
              {transcript}
            </Typography>
          </Paper>
        </Box>
      ) : null}

      <Box
        sx={{
          position: 'fixed',
          right: { xs: 12, md: 20 },
          bottom: { xs: bottom, md: 40 },
          zIndex: 2101,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1.5,
          // 메뉴가 닫혀 있어도 내부 리스트(Box)가 DOM에 남아 높이를 차지해서
          // 투명한 컨테이너가 콘텐츠 클릭을 가리는 이슈가 발생할 수 있어,
          // 외곽은 클릭을 통과시키고 실제 인터랙션 요소만 pointer-events를 받도록 처리한다.
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1.25,
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(10px)',
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'all 160ms ease',
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1.25,
              borderRadius: 4,
              bgcolor: 'common.white',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
              mb: 0.5,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'text.secondary' }}>글자 크기</Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: '#F1F5F9',
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
              }}
            >
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation()
                  decreaseFontScaleLevel()
                }}
                disabled={fontScaleLevel <= 1}
                aria-label="글자 작게"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  bgcolor: 'common.white',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  opacity: fontScaleLevel <= 1 ? 0.35 : 1,
                }}
              >
                <RemoveIcon fontSize="small" />
              </ButtonBase>
              <Box sx={{ width: 52, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.primary', lineHeight: 1.2 }}>
                  {fontLabel}
                </Typography>
              </Box>
              <ButtonBase
                onClick={(e) => {
                  e.stopPropagation()
                  increaseFontScaleLevel()
                }}
                disabled={fontScaleLevel >= 3}
                aria-label="글자 크게"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  bgcolor: 'common.white',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  opacity: fontScaleLevel >= 3 ? 0.35 : 1,
                }}
              >
                <AddIcon fontSize="small" />
              </ButtonBase>
            </Box>
          </Paper>

          {menuItems.map((item) => (
            <ButtonBase
              key={item.id}
              onClick={() => {
                item.onClick()
                setMenuOpen(false)
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                borderRadius: 999,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  px: 1.5,
                  py: 0.9,
                  borderRadius: 999,
                  bgcolor: 'common.white',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Paper>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: item.color.bg,
                  color: item.color.fg,
                  border: '2px solid',
                  borderColor: 'divider',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                }}
              >
                {item.icon}
              </Box>
            </ButtonBase>
          ))}
        </Box>

        <Stack spacing={1.25} alignItems="flex-end" sx={{ pointerEvents: 'auto' }}>
          <ButtonBase
            onClick={() => {
              triggerHaptic(30)
              navigate(ROUTE_PATHS.notifications)
            }}
            aria-label="알림"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              bgcolor: '#3B82F6',
              color: 'common.white',
              boxShadow: '0 16px 30px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:active': { transform: 'scale(0.9)' },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </ButtonBase>

          <ButtonBase
            onClick={() => {
              triggerHaptic(50)
              setMenuOpen((prev) => !prev)
            }}
            aria-label={menuOpen ? '퀵 메뉴 닫기' : '퀵 메뉴 열기'}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              bgcolor: menuOpen ? '#475569' : '#2EC4B6',
              color: 'common.white',
              boxShadow: '0 16px 30px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'all 160ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
              '&:active': { transform: menuOpen ? 'rotate(45deg) scale(0.9)' : 'scale(0.9)' },
            }}
          >
            {menuOpen ? <CloseIcon /> : <AddIcon />}
          </ButtonBase>

          <ButtonBase
            onClick={() => {
              triggerHaptic(40)
              toggleVoice()
            }}
            aria-label="음성 명령"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              bgcolor: isListening ? '#EF4444' : '#7C8CFF',
              color: 'common.white',
              boxShadow: '0 16px 30px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isListening ? 'scale(1.1)' : 'scale(1)',
              '&:active': { transform: isListening ? 'scale(1.0) ' : 'scale(0.9)' },
            }}
          >
            <MicIcon />
          </ButtonBase>
        </Stack>
      </Box>

      <DietEntryModal
        open={activeModal === 'diet'}
        onClose={() => setActiveModal(null)}
      />
      <MedicationEntryModal
        open={activeModal === 'medication'}
        onClose={() => setActiveModal(null)}
        targetUserId={modalTarget?.id}
        targetUserName={modalTarget?.name}
      />
      <DiseaseEntryModal
        open={activeModal === 'disease'}
        onClose={() => setActiveModal(null)}
        targetUserId={modalTarget?.id}
        targetUserName={modalTarget?.name}
      />
      <OcrEntryModal
        open={activeModal === 'ocr'}
        onClose={() => setActiveModal(null)}
        targetUserId={modalTarget?.id}
        targetUserName={modalTarget?.name}
      />
    </>
  )
}

export default FloatingActionButtons

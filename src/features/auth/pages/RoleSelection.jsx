import logger from '@core/utils/logger'

/**
 * RoleSelection Page
 * - 역할 선택 페이지(프로토타입)
 * - 어르신/보호자 선택 후 대시보드로 이동
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material'
import { BackButton } from '@shared/components/mui/BackButton'

export const RoleSelection = () => {
  const navigate = useNavigate()
  const { selectRole, customerRole } = useAuth((state) => ({
    selectRole: state.selectRole,
    customerRole: state.customerRole,
  }))

  useEffect(() => {
    const normalizedRole = customerRole?.toUpperCase()
    if (normalizedRole === USER_ROLES.SENIOR) {
      navigate(ROUTE_PATHS.seniorDashboard)
    } else if (normalizedRole === USER_ROLES.CAREGIVER) {
      navigate(ROUTE_PATHS.caregiverDashboard)
    }
  }, [customerRole, navigate])

  const handleSelectRole = async (role) => {
    try {
      await selectRole(role)
      const normalizedRole = role?.toUpperCase()
      if (normalizedRole === USER_ROLES.SENIOR) {
        navigate(ROUTE_PATHS.seniorDashboard)
      } else if (normalizedRole === USER_ROLES.CAREGIVER) {
        navigate(ROUTE_PATHS.caregiverDashboard)
      }
    } catch (err) {
      logger.error('역할 선택 실패:', err)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        px: { xs: 2.5, sm: 3 },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 2 }}>
          <BackButton label="뒤로" />
        </Stack>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Box>
            <Typography component="div" sx={{ fontSize: 56 }}>
              💊
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
              뭐냑? (AMA...Pill)
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              역할을 선택하고 맞춤 대시보드로 이동하세요
            </Typography>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              역할을 선택해 주세요
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <ButtonBase
                onClick={() => handleSelectRole(USER_ROLES.SENIOR)}
                sx={{ flex: 1, textAlign: 'left', borderRadius: 2 }}
              >
                <Paper variant="outlined" sx={{ p: 3, width: '100%' }}>
                  <Stack spacing={1}>
                    <Typography component="div" sx={{ fontSize: 44 }}>
                      🧓
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      어르신(부모)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      내 복약 일정 관리
                    </Typography>
                  </Stack>
                </Paper>
              </ButtonBase>

              <ButtonBase
                onClick={() => handleSelectRole(USER_ROLES.CAREGIVER)}
                sx={{ flex: 1, textAlign: 'left', borderRadius: 2 }}
              >
                <Paper variant="outlined" sx={{ p: 3, width: '100%' }}>
                  <Stack spacing={1}>
                    <Typography component="div" sx={{ fontSize: 44 }}>
                      👪
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      보호자(자녀)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      가족 복약 모니터링
                    </Typography>
                  </Stack>
                </Paper>
              </ButtonBase>
            </Stack>
          </Box>

          <Typography variant="caption" color="text.secondary">
            개발 모드 | 로그인 기능은 진행 중
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export default RoleSelection

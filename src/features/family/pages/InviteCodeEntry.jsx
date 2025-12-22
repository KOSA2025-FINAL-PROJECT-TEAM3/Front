/**
 * InviteCodeEntry.jsx
 * 통합 초대 랜딩 페이지
 * - 모든 초대(링크/코드)의 진입점
 * - 로그인 여부에 따라 분기 처리
 * - 보안 강화: 명시적 수락 필수
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import { publicInviteApiClient } from '@core/services/api/publicInviteApiClient'
import logger from '@core/utils/logger'
import { useInviteStore } from '../stores/inviteStore'
import { useFamily } from '../hooks/useFamily'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@shared/components/toast/toastStore'
import { BackButton } from '@shared/components/mui/BackButton'

const ROLE_LABELS = {
  SENIOR: '시니어(케어 대상자)',
  CAREGIVER: '보호자(케어 제공자)',
}

const ROLE_ICONS = {
  SENIOR: '👵',
  CAREGIVER: '🧑‍⚕️',
}

export const InviteCodeEntryPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tokenFromUrl = searchParams.get('token')

  // Stores
  const { setInviteSession, clearInviteSession, inviteSession } = useInviteStore()
  const { isAuthenticated, user, logout: authLogout } = useAuthStore()
  const { acceptInvite, refetchFamily } = useFamily((state) => ({
    acceptInvite: state.acceptInvite,
    refetchFamily: state.refetchFamily,
  }))

  // Local State
  const [inputCode, setInputCode] = useState('')
  const [status, setStatus] = useState('idle') // idle, validating, validated, accepting, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [inviteInfo, setInviteInfo] = useState(null)

  // 1. 코드/토큰 검증
  const handleValidateCode = useCallback(async (valueToValidate = inputCode) => {
    const isLongToken = valueToValidate.length > 6

    if (!isLongToken && valueToValidate.length !== 6) {
      setErrorMessage('6자리 초대 코드를 입력해주세요.')
      return
    }

    setStatus('validating')
    setErrorMessage('')

    try {
      let response
      if (isLongToken) {
        response = await publicInviteApiClient.startInvite(valueToValidate)
      } else {
        response = await publicInviteApiClient.getInviteInfo(valueToValidate)
      }

      const info = {
        inviteCode: response.shortCode || valueToValidate,
        shortCode: response.shortCode || valueToValidate,
        token: isLongToken ? valueToValidate : null, // Store Long Token for Open Invite flow
        groupId: response.groupId,
        groupName: response.groupName || '가족 그룹',
        inviterName: response.inviterName || '알 수 없음',
        inviterEmail: response.inviterEmail,
        suggestedRole: response.suggestedRole || 'SENIOR',
        expiresAt: response.expiresAt,
      }

      setInviteInfo(info)
      setInviteSession(info)
      setStatus('validated')
    } catch (error) {
      logger.warn('[InviteCodeEntry] Validation failed', error)
      setStatus('error')
      if (error?.response?.status === 400) {
        setErrorMessage('초대 코드가 만료되었거나 잘못되었습니다.')
      } else if (error?.response?.status === 404) {
        setErrorMessage('존재하지 않는 초대 코드입니다.')
      } else if (error?.response?.status === 429) {
        setErrorMessage('요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setErrorMessage('초대 확인 중 오류가 발생했습니다.')
      }
    }
  }, [inputCode, setInviteSession])

  // 2. 초기 진입 처리 (URL 토큰)
  useEffect(() => {
    if (tokenFromUrl && status === 'idle') {
      handleValidateCode(tokenFromUrl)
    }
  }, [handleValidateCode, status, tokenFromUrl])

  // 3. 세션 복원
  useEffect(() => {
    if (inviteSession && !inviteInfo && status === 'idle') {
      setInviteInfo(inviteSession)
      setInputCode(inviteSession.shortCode || inviteSession.inviteCode || '')
      setStatus('validated')
    }
  }, [inviteSession, inviteInfo, status])

  // 4. 초대 수락 (로그인 상태에서만 호출됨)
  const handleAcceptInvite = async () => {
    if (!inviteInfo?.shortCode && !inviteInfo?.inviteCode) return
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.')
      handleGoToLogin()
      return
    }

    setStatus('accepting')
    const code = inviteInfo.shortCode || inviteInfo.inviteCode
    const token = inviteInfo.token // Long token if available

    try {
      // If we have a long token (Open Invite), use it. Otherwise use short code (Legacy).
      const payload = token ? { token } : { shortCode: code }
      await acceptInvite(payload)
      await refetchFamily?.()

      setStatus('success')
      clearInviteSession()
      toast.success('가족 초대를 수락했습니다!')

      setTimeout(() => {
        if (inviteInfo.suggestedRole === 'CAREGIVER') {
          navigate(ROUTE_PATHS.caregiverDashboard, { replace: true })
        } else {
          navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
        }
      }, 1500)
    } catch (error) {
      logger.warn('[InviteCodeEntry] Accept failed', error)
      setStatus('validated')

      if (error?.response?.status === 409) {
        toast.info('이미 가입된 가족 그룹입니다.')
        navigate(ROUTE_PATHS.family, { replace: true })
      } else if (error?.response?.status === 403) {
        // Identity mismatch - 초대받은 이메일과 현재 로그인된 이메일이 다름
        toast.error('이 초대는 다른 이메일 주소로 발송되었습니다. 초대받은 이메일로 로그인해주세요.')
        setStatus('validated') // 다시 시도할 수 있도록 상태 유지
      } else {
        toast.error('초대 수락에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  // 5. 로그인 페이지로 이동 (리다이렉트 URL 불필요, 세션스토리지 사용)
  const handleGoToLogin = () => {
    navigate(ROUTE_PATHS.login)
  }

  // 6. 회원가입 페이지로 이동
  const handleGoToSignup = () => {
    navigate(ROUTE_PATHS.signup)
  }

  // 7. 로그아웃 (초대 세션 유지)
  const handleLogout = async () => {
    try {
      // 현재 초대 세션 백업 (안전장치)
      const currentSession = inviteSession
      await authLogout()
      // 로그아웃 후 세션 복원 (혹시 authLogout이 스토리지를 건드린 경우 대비)
      if (currentSession) {
        setInviteSession(currentSession)
      }
      window.location.reload()
    } catch (error) {
      logger.error('Logout failed', error)
    }
  }

  const handleReset = () => {
    setInputCode('')
    setInviteInfo(null)
    setStatus('idle')
    setErrorMessage('')
    clearInviteSession()
    navigate(ROUTE_PATHS.inviteCodeEntry, { replace: true })
  }

  // --- Render Steps ---

  const InviteShell = ({ children }) => (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-start">
        <BackButton label="뒤로" />
      </Stack>
      {children}
    </Stack>
  )

		  if (status === 'success') {
	    return (
	      <Box
	        sx={{
	          minHeight: '100vh',
          py: 3,
          px: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
	        }}
	      >
	        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
	          <InviteShell>
	            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
	              <Typography component="div" sx={{ fontSize: 48, mb: 2 }}>
	                🎉
	              </Typography>
	              <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
	                가족에 합류했어요!
	              </Typography>
	              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
	                잠시 후 대시보드로 이동합니다...
	              </Typography>
	            </Paper>
	          </InviteShell>
	        </Box>
	      </Box>
	    )
	  }

  // 검증 완료 상태: 초대 카드 표시
  if (status === 'validated' && inviteInfo) {
    const role = inviteInfo.suggestedRole || 'SENIOR'
    const roleColor = role === 'CAREGIVER' ? 'success' : 'primary'

	    return (
	      <Box
	        sx={{
	          minHeight: '100vh',
          py: 3,
          px: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
	        }}
	      >
	        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
	          <InviteShell>
	            <Stack spacing={3}>
	              <Box textAlign="center">
	                <Typography variant="h5" sx={{ fontWeight: 800 }}>
	                  가족 초대
	                </Typography>
	                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
	                  아래 정보를 확인하고 가족에 합류해주세요.
	                </Typography>
	              </Box>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    가족 그룹
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {inviteInfo.groupName}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    초대한 사람
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {inviteInfo.inviterName}
                  </Typography>
                </Stack>

                <Divider />

                <Box textAlign="center" sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    예정된 역할
                  </Typography>
                  <Chip
                    color={roleColor}
                    variant="filled"
                    sx={{ mt: 1, fontWeight: 800 }}
                    icon={
                      <Box component="span" sx={{ fontSize: 18 }}>
                        {ROLE_ICONS[role]}
                      </Box>
                    }
                    label={ROLE_LABELS[role] || role}
                  />
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                {isAuthenticated ? (
                  <>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        현재 접속 중인 계정
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {user?.name} ({user?.email})
                      </Typography>
                    </Box>

                    <Button
                      type="button"
                      variant="contained"
                      color="success"
                      onClick={handleAcceptInvite}
                      disabled={status === 'accepting'}
                      startIcon={
                        status === 'accepting' ? <CircularProgress size={18} color="inherit" /> : null
                      }
                      sx={{ py: 1.5, fontWeight: 800 }}
                    >
                      {status === 'accepting' ? '처리 중...' : '이 계정으로 수락하기'}
                    </Button>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Stack spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        본인이 아니신가요?
                      </Typography>
                      <Button type="button" color="error" variant="outlined" onClick={handleLogout}>
                        로그아웃
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Alert severity="info">초대를 수락하려면 로그인이 필요합니다.</Alert>
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleGoToLogin}
                      sx={{ py: 1.5, fontWeight: 800 }}
                    >
                      로그인
                    </Button>
                    <Button type="button" variant="outlined" onClick={handleGoToSignup}>
                      회원가입
                    </Button>
                  </>
                )}

                <Button type="button" variant="outlined" color="inherit" onClick={handleReset}>
                  다른 코드 입력하기
                </Button>
              </Stack>
            </Paper>
	            </Stack>
	          </InviteShell>
	        </Box>
	      </Box>
	    )
	  }

  // 초기 상태: 코드 입력 폼
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 3,
        px: { xs: 2.5, sm: 3 },
        background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
        <InviteShell>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                초대 코드 입력
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                가족으로부터 받은 6자리 초대 코드를 입력해주세요.
              </Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <TextField
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="초대 코드 6자리"
                  disabled={status === 'validating'}
                  inputProps={{ maxLength: 6 }}
                  fullWidth
                  autoFocus
                  sx={{
                    '& .MuiInputBase-input': {
                      py: 1.75,
                      fontSize: 24,
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.5em',
                      textTransform: 'uppercase',
                    },
                  }}
                />

                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                <Button
                  type="button"
                  variant="contained"
                  onClick={() => handleValidateCode()}
                  disabled={inputCode.length < 6 || status === 'validating'}
                  startIcon={status === 'validating' ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{ py: 1.5, fontWeight: 800 }}
                >
                  {status === 'validating' ? '확인 중...' : '코드 확인'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </InviteShell>
      </Box>
    </Box>
  )
}

export default InviteCodeEntryPage

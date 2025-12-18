/**
 * KakaoCallback Page
 * - 카카오 OAuth 성공/실패 처리
 * - code/state 파라미터를 Auth Store kakaoLogin에 전달
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useInviteStore } from '@features/family/stores/inviteStore'
	import { STORAGE_KEYS, USER_ROLES } from '@config/constants'
	import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
	import { ROUTE_PATHS } from '@config/routes.config'
	import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
	import { BackButton } from '@shared/components/mui/BackButton'

export const KakaoCallbackPage = () => {
  const navigate = useNavigate()
  const { kakaoLogin, reactivate } = useAuth((state) => ({
    kakaoLogin: state.kakaoLogin,
    reactivate: state.reactivate,
  }))
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('카카오 로그인 처리 중입니다...')
  const [errorMessage, setErrorMessage] = useState(null)
  const [reactivationToken, setReactivationToken] = useState(null)

  const processedRef = useRef(false)

  // 1. Login Trigger Effect (Runs once)
  useEffect(() => {
    if (processedRef.current) return

    const code = searchParams.get('code')
    const receivedState = searchParams.get('state')
    const kakaoError = searchParams.get('error')
    const kakaoErrorDescription = searchParams.get('error_description')
    const expectedState =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEYS.KAKAO_STATE)
        : null

    if (kakaoError) {
      setStatus('카카오 로그인에 실패했습니다.')
      setErrorMessage(kakaoErrorDescription || kakaoError)
      return
    }

    if (!code) {
      setStatus('카카오 인증 코드가 없습니다.')
      setErrorMessage('다시 로그인 화면으로 이동해 주세요.')
      return
    }

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      setStatus('카카오 인증 요청이 유효하지 않습니다.')
      setErrorMessage('브라우저를 새로고침 후 다시 로그인해 주세요.')
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
      }
      return
    }

    // Mark as processed to prevent double-invocation
    processedRef.current = true

    const runLogin = async () => {
      try {
        await kakaoLogin(code)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
        }
      } catch (err) {
        // 403 Account Deactivated 처리
        if (err.response?.status === 403 && err.response?.data?.reactivationToken) {
          const { deactivatedAt, reactivationToken } = err.response.data
          let dateMsg = '이전에'

          if (deactivatedAt) {
            try {
              const date = new Date(deactivatedAt)
              dateMsg = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) + '에'
            } catch (e) {
              // Date parsing fail fallback
            }
          }

          setStatus('비활성화된 계정입니다.')
          setErrorMessage(`${dateMsg} 탈퇴한 계정이 있습니다. 다시 활성화하시겠습니까?`)
          setReactivationToken(reactivationToken)
          return
        }

        setStatus('카카오 로그인 과정에서 오류가 발생했습니다.')
        setErrorMessage(err.message || '잠시 후 다시 시도해 주세요.')
        // Reset processed ref on error to allow retry if needed (though code is likely invalid now)
      }
    }

    runLogin()
  }, [kakaoLogin, searchParams])

  // 2. Navigation Effect (Reacts to auth state changes)
  const { isAuthenticated, customerRole, user } = useAuth((state) => ({
    isAuthenticated: state.isAuthenticated,
    customerRole: state.customerRole,
    user: state.user,
  }))

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Check for valid invite session first
      const { isSessionValid } = useInviteStore.getState()
      if (isSessionValid()) {
        navigate(ROUTE_PATHS.inviteCodeEntry, { replace: true })
        return
      }

      const role =
        normalizeCustomerRole(customerRole) ||
        normalizeCustomerRole(user?.customerRole)

      if (!role) {
        navigate(ROUTE_PATHS.roleSelection, { replace: true })
      } else if (role === USER_ROLES.SENIOR) {
        navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
      } else if (role === USER_ROLES.CAREGIVER) {
        navigate(ROUTE_PATHS.caregiverDashboard, { replace: true })
      }
    }
  }, [isAuthenticated, customerRole, user, navigate])

  const handleReactivate = async () => {
    if (!reactivationToken) return
    try {
      setStatus('계정 활성화 중...')
      setErrorMessage(null)
      await reactivate(reactivationToken)
      // 성공 시 isAuthenticated가 true가 되어 useEffect가 네비게이션 처리함
    } catch (err) {
      setStatus('계정 활성화 실패')
      setErrorMessage(err.message || '활성화 중 오류가 발생했습니다.')
      setReactivationToken(null)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 3,
        px: { xs: 2.5, sm: 3 },
        background: 'linear-gradient(135deg, #f7f9fc, #eef2ff)',
      }}
	    >
	      <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
	        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 1 }}>
	          <BackButton label="뒤로" />
	        </Stack>
	        <Paper elevation={6} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, textAlign: 'center' }}>
	          <Stack spacing={2}>
	            <Typography component="div" sx={{ fontSize: 42 }}>
	              💊
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              뭐냑? (AMA...Pill)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {status}
            </Typography>

            {errorMessage ? (
              <Alert
                severity={reactivationToken ? 'warning' : 'error'}
                action={
                  reactivationToken ? (
                    <Button color="inherit" size="small" onClick={handleReactivate}>
                      활성화하기
                    </Button>
                  ) : (
                    <Button color="inherit" size="small" onClick={() => navigate(ROUTE_PATHS.login, { replace: true })}>
                      로그인 화면으로
                    </Button>
                  )
                }
              >
                {errorMessage}
              </Alert>
            ) : null}
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default KakaoCallbackPage

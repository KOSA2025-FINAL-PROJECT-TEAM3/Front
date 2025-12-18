/**
 * Login Page
 * - 이메일/비밀번호 로그인, 카카오 로그인, 회원가입 링크
 */

	import { useNavigate, Link, useSearchParams } from 'react-router-dom'
	import { ROUTE_PATHS } from '@config/routes.config'
	import { USER_ROLES } from '@config/constants'
	import { useForm } from 'react-hook-form'
	import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
	import { useAuth } from '@features/auth/hooks/useAuth'
	import { useAuthStore } from '@features/auth/store/authStore'
	import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
	import { KakaoLoginButton } from '@features/auth/components/KakaoLoginButton'
	import { BackButton } from '@shared/components/mui/BackButton'

import { useInviteStore } from '@features/family/stores/inviteStore'

const roleDestinationMap = {
  [USER_ROLES.SENIOR]: ROUTE_PATHS.seniorDashboard,
  [USER_ROLES.CAREGIVER]: ROUTE_PATHS.caregiverDashboard,
}

const navigateAfterAuthentication = (navigate, redirectPath) => {
  // 1. Check for valid invite session first
  const { isSessionValid } = useInviteStore.getState()
  if (isSessionValid()) {
    navigate(ROUTE_PATHS.inviteCodeEntry, { replace: true })
    return
  }

  // 2. Check for explicit redirect path
  if (redirectPath) {
    navigate(redirectPath, { replace: true })
    return
  }

  const authState = useAuthStore.getState()
  const resolvedRole =
    normalizeCustomerRole(authState.customerRole) ||
    normalizeCustomerRole(authState.user?.customerRole)

  if (!resolvedRole) {
    navigate(ROUTE_PATHS.roleSelection, { replace: true })
    return
  }

  const destination = roleDestinationMap[resolvedRole] || ROUTE_PATHS.roleSelection
  navigate(destination, { replace: true })
}

export const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect'))
    : null // null로 원복

  const { login, reactivate, loading, error, clearError } = useAuth((state) => ({
    login: state.login,
    reactivate: state.reactivate,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }))

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const combinedError = errors.root?.message || error

  const handleLogin = async (formData) => {
    try {
      await login(formData.email, formData.password)
      navigateAfterAuthentication(navigate, redirectPath)
    } catch (err) {
      // 403 Forbidden & Reactivation Token 존재 시 복구 프로세스 진행
      const res = err.response
      if (res?.status === 403 && res?.data?.reactivationToken) {
        const deactivatedAt = res.data.deactivatedAt || '날짜 정보 없음'
        const confirmReactivate = window.confirm(
          `해당 계정은 ${deactivatedAt}에 탈퇴 처리되었습니다.\n계정을 복구하고 다시 활성화하시겠습니까?`
        )

        if (confirmReactivate) {
          try {
            await reactivate(res.data.reactivationToken)
            alert('계정이 성공적으로 복구되었습니다.')
            navigateAfterAuthentication(navigate, redirectPath)
            return
          } catch (reactivateErr) {
            console.error(reactivateErr)
            setError('root', {
              type: 'server',
              message: '계정 복구 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            })
            return
          }
        } else {
            // 복구 거절 시
            setError('root', {
                type: 'server',
                message: '탈퇴한 계정입니다.',
            })
            return
        }
      }

      setError('root', {
        type: 'server',
        message: err.message || '로그인에 실패했습니다.',
      })
    }
  }

  const resetErrors = () => {
    if (combinedError) {
      clearErrors('root')
      clearError?.()
    }
  }

	  return (
	    <Box
	      sx={{
	        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 3, sm: 4 },
        px: 2.5,
        bgcolor: 'background.default',
      }}
	    >
	      <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
	        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 1 }}>
	          <BackButton label="뒤로" />
	        </Stack>
	        <Paper
	          variant="outlined"
	          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            borderColor: 'divider',
            boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)',
          }}
        >
          <Stack spacing={3} textAlign="center">
            <Box>
              <Typography component="div" sx={{ fontSize: 44 }}>
                💊
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>
                뭐냑? (AMA...Pill)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                가족이 함께 챙기는 복약 플랫폼
              </Typography>
            </Box>

            <Stack component="form" spacing={2} onSubmit={handleSubmit(handleLogin)}>
              {combinedError ? <Alert severity="error">{combinedError}</Alert> : null}

              <TextField
                label="이메일"
                type="email"
                placeholder="your@email.com"
                disabled={loading}
                error={Boolean(errors.email)}
                helperText={errors.email?.message || ''}
                onFocus={resetErrors}
                {...register('email', {
                  required: '이메일을 입력해 주세요',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '유효한 이메일 형식이 아닙니다',
                  },
                })}
                fullWidth
              />

              <TextField
                label="비밀번호"
                type="password"
                placeholder="최소 6자 이상"
                disabled={loading}
                error={Boolean(errors.password)}
                helperText={errors.password?.message || ''}
                onFocus={resetErrors}
                {...register('password', {
                  required: '비밀번호를 입력해 주세요',
                  minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
                })}
                fullWidth
              />

              <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.3, fontWeight: 900 }}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </Stack>

            <Divider>또는</Divider>

            <KakaoLoginButton
              disabled={loading}
              onUnavailable={(message) => setError('root', { type: 'manual', message })}
            />

            <Typography variant="body2" color="text.secondary">
              계정이 없으신가요?{' '}
              <Link to={ROUTE_PATHS.signup} style={{ fontWeight: 800 }}>
                회원가입
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default Login

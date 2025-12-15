/**
 * Login Page
 * - 이메일/비밀번호 로그인, 카카오 로그인, 회원가입 링크
 */

import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { useForm } from 'react-hook-form'
import { Alert, Box, Button, Container, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useAuthStore } from '@features/auth/store/authStore'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { KakaoLoginButton } from '@features/auth/components/KakaoLoginButton'

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

  const { login, loading, error, clearError } = useAuth((state) => ({
    login: state.login,
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
        py: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ maxWidth: 460 }}>
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
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
      </Container>
    </Box>
  )
}

export default Login

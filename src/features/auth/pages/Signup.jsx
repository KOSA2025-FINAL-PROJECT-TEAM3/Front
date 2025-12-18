/**
 * Signup Page
 * - 이메일/비밀번호 회원가입, 역할 선택, 로그인 링크
 */

import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Box, Button, Paper, Radio, RadioGroup, FormControlLabel, Stack, TextField, Typography } from '@mui/material'
	import { useAuth } from '@features/auth/hooks/useAuth'
	import { useAuthStore } from '@features/auth/store/authStore'
	import { useInviteStore } from '@features/family/stores/inviteStore'
	import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
	import { BackButton } from '@shared/components/mui/BackButton'

const DEFAULT_USER_ROLE = 'ROLE_USER'

const roleDestinationMap = {
  [USER_ROLES.SENIOR]: ROUTE_PATHS.seniorDashboard,
  [USER_ROLES.CAREGIVER]: ROUTE_PATHS.caregiverDashboard,
}

export const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const redirectPath = rawRedirect ? decodeURIComponent(rawRedirect) : null // null로 원복

  const { signup, loading, error, clearError } = useAuth((state) => ({
    signup: state.signup,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }))
  
  // 초대 세션에서 제안된 역할 가져오기
  const { getSuggestedRole, isSessionValid } = useInviteStore((state) => ({
    getSuggestedRole: state.getSuggestedRole,
    isSessionValid: state.isSessionValid,
  }))
  
  const suggestedRole = isSessionValid() ? getSuggestedRole() : null
  const isInviteSignup = !!suggestedRole

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      customerRole: suggestedRole || USER_ROLES.SENIOR,
    },
  })

  const combinedError = errors.root?.message || error
  const passwordValue = watch('password')

  const handleSignup = async (formData) => {
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        userRole: DEFAULT_USER_ROLE,
        customerRole: formData.customerRole,
      })
      
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
      // ... (이하 생략) ...
      const resolvedRole =
        normalizeCustomerRole(authState.customerRole) ||
        normalizeCustomerRole(authState.user?.customerRole) ||
        normalizeCustomerRole(formData.customerRole)

      if (!resolvedRole) {
        navigate(ROUTE_PATHS.roleSelection)
        return
      }

      navigate(roleDestinationMap[resolvedRole] || ROUTE_PATHS.roleSelection)
    } catch (err) {
      const errorMessage =
        err?.response?.status === 409
          ? '이미 사용 중인 이메일입니다.'
          : err.message || '회원가입에 실패했습니다.'
      setError('root', {
        type: 'server',
        message: errorMessage,
      })
    }
  }

  const handleFocus = () => {
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
                새 계정 만들기
              </Typography>
            </Box>

            <Stack component="form" spacing={2} onSubmit={handleSubmit(handleSignup)}>
              {combinedError ? <Alert severity="error">{combinedError}</Alert> : null}

              <TextField
                label="이메일"
                type="email"
                placeholder="your@email.com"
                disabled={loading}
                error={Boolean(errors.email)}
                helperText={errors.email?.message || ''}
                onFocus={handleFocus}
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
                label="이름"
                placeholder="홍길동"
                disabled={loading}
                error={Boolean(errors.name)}
                helperText={errors.name?.message || ''}
                onFocus={handleFocus}
                {...register('name', {
                  required: '이름을 입력해 주세요',
                  minLength: { value: 2, message: '이름은 최소 2자 이상이어야 합니다' },
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
                onFocus={handleFocus}
                {...register('password', {
                  required: '비밀번호를 입력해 주세요',
                  minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
                })}
                fullWidth
              />

              <TextField
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호를 다시 입력해 주세요"
                disabled={loading}
                error={Boolean(errors.passwordConfirm)}
                helperText={errors.passwordConfirm?.message || ''}
                onFocus={handleFocus}
                {...register('passwordConfirm', {
                  required: '비밀번호를 다시 입력해 주세요',
                  validate: (value) => value === passwordValue || '비밀번호가 일치하지 않습니다',
                })}
                fullWidth
              />

              <Box textAlign="left">
                <Typography variant="caption" color="text.secondary">
                  역할 선택
                </Typography>
                {isInviteSignup ? (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    초대 링크를 통해 가입하시면 역할이 자동으로 설정됩니다.
                  </Alert>
                ) : null}

                <Controller
                  name="customerRole"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel
                        value={USER_ROLES.SENIOR}
                        control={<Radio disabled={loading || isInviteSignup} />}
                        label="어르신(부모)"
                      />
                      <FormControlLabel
                        value={USER_ROLES.CAREGIVER}
                        control={<Radio disabled={loading || isInviteSignup} />}
                        label="보호자(자녀)"
                      />
                    </RadioGroup>
                  )}
                />
              </Box>

              <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.3, fontWeight: 900 }}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              이미 계정이 있으신가요?{' '}
              <Link to={ROUTE_PATHS.login} style={{ fontWeight: 800 }}>
                로그인
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default Signup

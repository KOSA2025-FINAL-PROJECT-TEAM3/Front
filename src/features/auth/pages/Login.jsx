/**
 * Login Page
 * - 이메일/비밀번호 로그인, 카카오 로그인, 회원가입 링크
 */

import { useNavigate, Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useForm } from 'react-hook-form'
import { useAuth } from '@features/auth/hooks/useAuth'
import { KakaoLoginButton } from '@features/auth/components/KakaoLoginButton'
import styles from './Login.module.scss'

export const Login = () => {
  const navigate = useNavigate()
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
      navigate(ROUTE_PATHS.roleSelection)
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
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
          <p className={styles.subtitle}>가족이 함께 챙기는 복약 플랫폼</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(handleLogin)}>
          {combinedError && (
            <div className={styles.errorMessage}>{combinedError}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              {...register('email', {
                required: '이메일을 입력해 주세요',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '유효한 이메일 형식이 아닙니다',
                },
              })}
              onFocus={resetErrors}
              disabled={loading}
            />
            {errors.email && (
              <p className={styles.fieldError}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="최소 6자 이상"
              {...register('password', {
                required: '비밀번호를 입력해 주세요',
                minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
              })}
              onFocus={resetErrors}
              disabled={loading}
            />
            {errors.password && (
              <p className={styles.fieldError}>{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.divider}>또는</div>

        <KakaoLoginButton
          className={styles.kakaoButton}
          disabled={loading}
          onUnavailable={(message) => setError('root', { type: 'manual', message })}
        />

        <div className={styles.signupLink}>
          계정이 없으신가요?{' '}
          <Link to={ROUTE_PATHS.signup} className={styles.link}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login

/**
 * Signup Page
 * - 이메일/비밀번호 회원가입, 역할 선택, 로그인 링크
 */

import { useNavigate, Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useForm } from 'react-hook-form'
import { useAuth } from '@features/auth/hooks/useAuth'
import styles from './Signup.module.scss'

export const Signup = () => {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuth((state) => ({
    signup: state.signup,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }))

  const {
    register,
    handleSubmit,
    watch,
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
      role: 'senior',
    },
  })

  const combinedError = errors.root?.message || error
  const passwordValue = watch('password')

  const handleSignup = async (formData) => {
    try {
      await signup(formData.email, formData.password, formData.name, formData.role)
      navigate(ROUTE_PATHS.seniorDashboard)
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err.message || '회원가입에 실패했습니다.',
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
    <div className={styles.signupContainer}>
      <div className={styles.signupBox}>
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
          <p className={styles.subtitle}>새 계정 만들기</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(handleSignup)}>
          {combinedError && <div className={styles.errorMessage}>{combinedError}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>이메일</label>
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
              onFocus={handleFocus}
              disabled={loading}
            />
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>이름</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="홍길동"
              {...register('name', {
                required: '이름을 입력해 주세요',
                minLength: { value: 2, message: '이름은 최소 2자 이상이어야 합니다' },
              })}
              onFocus={handleFocus}
              disabled={loading}
            />
            {errors.name && <p className={styles.fieldError}>{errors.name.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="최소 6자 이상"
              {...register('password', {
                required: '비밀번호를 입력해 주세요',
                minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
              })}
              onFocus={handleFocus}
              disabled={loading}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passwordConfirm" className={styles.label}>비밀번호 확인</label>
            <input
              id="passwordConfirm"
              type="password"
              className={styles.input}
              placeholder="비밀번호를 다시 입력해 주세요"
              {...register('passwordConfirm', {
                required: '비밀번호를 다시 입력해 주세요',
                validate: (value) => value === passwordValue || '비밀번호가 일치하지 않습니다',
              })}
              onFocus={handleFocus}
              disabled={loading}
            />
            {errors.passwordConfirm && (
              <p className={styles.fieldError}>{errors.passwordConfirm.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <span className={styles.label}>역할 선택</span>
            <div className={styles.roleButtons}>
              <label className={styles.radioLabel}>
                <input type="radio" value="senior" {...register('role')} disabled={loading} />
                <span className={styles.radioButton}>어르신(부모)</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="caregiver" {...register('role')} disabled={loading} />
                <span className={styles.radioButton}>보호자(자녀)</span>
              </label>
            </div>
          </div>

          <button type="submit" className={styles.signupButton} disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.loginLink}>
          이미 계정이 있으신가요?{' '}
          <Link to={ROUTE_PATHS.login} className={styles.link}>로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup

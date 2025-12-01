import { useEffect } from 'react' // Import useEffect
import { useNavigate, Link } from 'react-router-dom'
// ... imports ...

export const InviteSignup = () => {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuth((state) => ({
    signup: state.signup,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }))

  const { acceptInvite, refetchFamily } = useFamily((state) => ({
    acceptInvite: state.acceptInvite,
    refetchFamily: state.refetchFamily,
  }))
  
  const { inviteSession, clearInviteSession } = useInviteStore()

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
      customerRole: inviteSession?.suggestedRole || USER_ROLES.SENIOR,
    },
  })

  // [Fixed] Move redirect logic to useEffect and ensure hooks are called before return
  useEffect(() => {
    if (!inviteSession) {
      navigate(ROUTE_PATHS.login, { replace: true })
    }
  }, [inviteSession, navigate])

  if (!inviteSession) return null

  const combinedError = errors.root?.message || error
  const passwordValue = watch('password')
  
  // ... rest of the component ...

  const handleSignup = async (formData) => {
    try {
      // 1. 회원가입
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        userRole: DEFAULT_USER_ROLE,
        customerRole: formData.customerRole,
      })
    } catch (err) {
      // 회원가입 실패 에러 처리
      const signupErrorMessage =
        err?.response?.status === 409
          ? '이미 사용 중인 이메일입니다.'
          : err.message || '회원가입에 실패했습니다.'
      setError('root', {
        type: 'server',
        message: signupErrorMessage,
      })
      return // 회원가입 실패 시 아래 초대 수락 로직 실행하지 않음
    }

    // 2. 초대 수락
    const code = inviteSession.inviteCode || inviteSession.shortCode
    if (code) {
      try {
        await acceptInvite(code)
        await refetchFamily?.()
        toast.success('가입과 함께 가족 초대가 수락되었습니다!')
        clearInviteSession()
      } catch (acceptError) {
        console.warn('[InviteSignup] 초대 수락 실패:', acceptError)
        // 초대 수락 실패 시 사용자에게 알리고, 회원가입은 되었으므로 대시보드로 이동
        const acceptErrorMessage = acceptError?.response?.data?.message || '초대 수락에 실패했습니다.'
        toast.error(`회원가입은 완료되었으나, ${acceptErrorMessage}`)
      }
    }

    // 3. 대시보드 이동
    const authState = useAuthStore.getState()
    const role = authState.customerRole || formData.customerRole
    
    if (role === USER_ROLES.CAREGIVER) {
        navigate(ROUTE_PATHS.caregiverDashboard, { replace: true })
    } else {
        navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
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
          <h1 className={styles.title}>가족 초대 수락</h1>
          <p className={styles.subtitle}>회원가입하고 가족 그룹에 바로 참여하세요</p>
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
            <span className={styles.label}>역할 (초대장에 지정됨)</span>
            <div className={styles.roleButtons}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value={USER_ROLES.SENIOR}
                  {...register('customerRole')}
                  disabled={true} // 역할 변경 불가
                />
                <span className={styles.radioButton}>어르신(부모)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value={USER_ROLES.CAREGIVER}
                  {...register('customerRole')}
                  disabled={true} // 역할 변경 불가
                />
                <span className={styles.radioButton}>보호자(자녀)</span>
              </label>
            </div>
          </div>

          <button type="submit" className={styles.signupButton} disabled={loading}>
            {loading ? '가입 및 수락 중...' : '회원가입하고 수락하기'}
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

export default InviteSignup

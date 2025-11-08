/**
 * Login Page
 * - 이메일/비번 로그인
 * - 카카오 로그인 버튼
 * - 회원가입 링크
 * - 개발자용 뒷구멍 (빠른 접근)
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import styles from './Login.module.css'

/**
 * 로그인 페이지
 * @returns {JSX.Element} 로그인 페이지
 */
export const Login = () => {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState(null)

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setFormError(null)
    clearError()
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setFormError(null)
    clearError()
  }

  const validateForm = () => {
    if (!email) {
      setFormError('이메일을 입력해주세요')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('유효한 이메일 형식이 아닙니다')
      return false
    }
    if (!password) {
      setFormError('비밀번호를 입력해주세요')
      return false
    }
    if (password.length < 6) {
      setFormError('비밀번호는 최소 6자 이상이어야 합니다')
      return false
    }
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await login(email, password)
      navigate('/role-select')
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleKakaoLogin = () => {
    alert('카카오 로그인은 나중에 구현됩니다')
    // TODO: 카카오 OAuth 구현
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>실버케어</h1>
          <p className={styles.subtitle}>당신의 건강한 약 복용을 도와드립니다</p>
        </div>

        {/* 로그인 폼 */}
        <form className={styles.form} onSubmit={handleLogin}>
          {/* 에러 메시지 */}
          {(formError || error) && (
            <div className={styles.errorMessage}>
              {formError || error}
            </div>
          )}

          {/* 이메일 입력 */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="최소 6자 이상"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className={styles.divider}>또는</div>

        {/* 카카오 로그인 */}
        <button
          className={styles.kakaoButton}
          onClick={handleKakaoLogin}
          disabled={loading}
        >
          <span className={styles.kakaoIcon}>☕</span>
          카카오로 로그인
        </button>

        {/* 회원가입 링크 */}
        <div className={styles.signupLink}>
          계정이 없으신가요?{' '}
          <Link to="/signup" className={styles.link}>
            회원가입
          </Link>
        </div>

        {/* 개발자용 뒷구멍: 바로 대시보드 접근 */}
        <div className={styles.backdoor}>
          <details className={styles.details}>
            <summary className={styles.summary}>
              🚀 개발 모드 (클릭하여 확장)
            </summary>
            <div className={styles.backdoorContent}>
              <p className={styles.backdoorText}>
                로그인 없이 바로 역할을 선택하여 대시보드에 접근합니다
              </p>
              <button
                type="button"
                className={styles.backdoorButton}
                onClick={() => navigate('/role-select')}
              >
                👴 시니어 / 👩‍👩‍👧‍👦 보호자 선택하기
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default Login

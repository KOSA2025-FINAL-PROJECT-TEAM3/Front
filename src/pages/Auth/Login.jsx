/**
 * Login Page
 * - 이메일/비번 로그인
 * - 카카오 로그인 버튼
 * - 회원가입 링크
 * - 개발자용 뒷구멍 (빠른 접근)
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { KakaoLoginButton } from '../../components/auth/KakaoLoginButton'
import styles from './Login.module.css'

/**
 * 로그인 페이지
 * @returns {JSX.Element} 로그인 페이지
 */
export const Login = () => {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()

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
      navigate('/role-selection')
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
          <p className={styles.subtitle}>가족이 함께 챙기는 약 복용 파트너</p>
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
        <KakaoLoginButton
          className={styles.kakaoButton}
          disabled={loading}
          onUnavailable={(message) => setFormError(message)}
        />

        {/* 회원가입 링크 */}
        <div className={styles.signupLink}>
          계정이 없으신가요?{' '}
          <Link to="/signup" className={styles.link}>
            회원가입
          </Link>
        </div>

        {/* Dev Mode는 플로팅 패널에서 진입 */}
      </div>
    </div>
  )
}

export default Login

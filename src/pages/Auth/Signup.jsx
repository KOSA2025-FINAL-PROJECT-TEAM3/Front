/**
 * Signup Page
 * - 이메일/비번 회원가입
 * - 역할 선택 (시니어/보호자)
 * - 로그인 링크
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import styles from './Signup.module.css'

/**
 * 회원가입 페이지
 * @returns {JSX.Element} 회원가입 페이지
 */
export const Signup = () => {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('senior')
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

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value)
    setFormError(null)
    clearError()
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
    setFormError(null)
    clearError()
  }

  const handleRoleChange = (e) => {
    setRole(e.target.value)
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
    if (!name) {
      setFormError('이름을 입력해주세요')
      return false
    }
    if (name.length < 2) {
      setFormError('이름은 최소 2자 이상이어야 합니다')
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
    if (password !== passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다')
      return false
    }
    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await signup(email, password, name, role)
      navigate('/dashboard')
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBox}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>실버케어</h1>
          <p className={styles.subtitle}>회원가입</p>
        </div>

        {/* 회원가입 폼 */}
        <form className={styles.form} onSubmit={handleSignup}>
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

          {/* 이름 입력 */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              이름
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="홍길동"
              value={name}
              onChange={handleNameChange}
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

          {/* 비밀번호 확인 */}
          <div className={styles.formGroup}>
            <label htmlFor="passwordConfirm" className={styles.label}>
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              className={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              disabled={loading}
            />
          </div>

          {/* 역할 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>역할 선택</label>
            <div className={styles.roleButtons}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="senior"
                  checked={role === 'senior'}
                  onChange={handleRoleChange}
                  disabled={loading}
                />
                <span className={styles.radioButton}>
                  👴 시니어
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="guardian"
                  checked={role === 'guardian'}
                  onChange={handleRoleChange}
                  disabled={loading}
                />
                <span className={styles.radioButton}>
                  👩‍👩‍👧‍👦 보호자
                </span>
              </label>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className={styles.signupButton}
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className={styles.loginLink}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup

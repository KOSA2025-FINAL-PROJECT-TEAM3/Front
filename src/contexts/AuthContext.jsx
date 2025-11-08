/**
 * AuthContext - 인증 상태 전역 관리
 * - React Context API 기반 (명세서 준수)
 * - user, role, token 상태
 * - login, signup, kakaoLogin, logout 메서드
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AuthApiClient } from '../core/api/authApiClient'

/**
 * AuthContext 생성
 * @typedef {Object} AuthContextType
 * @property {Object|null} user - 사용자 정보
 * @property {string|null} role - 역할 (senior, guardian)
 * @property {string|null} token - JWT 토큰
 * @property {boolean} isAuthenticated - 인증 여부
 * @property {boolean} loading - 로딩 상태
 * @property {string|null} error - 에러 메시지
 * @property {Function} login - 이메일/비번 로그인
 * @property {Function} signup - 회원가입
 * @property {Function} kakaoLogin - 카카오 로그인
 * @property {Function} selectRole - 역할 선택
 * @property {Function} logout - 로그아웃
 * @property {Function} clearError - 에러 초기화
 */
export const AuthContext = createContext(null)

/**
 * AuthContext Provider 컴포넌트
 * @param {React.ReactNode} children - 자식 컴포넌트
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // localStorage에서 저장된 인증 정보 복원
  useEffect(() => {
    const savedToken = localStorage.getItem('silvercare-token')
    const savedUser = localStorage.getItem('silvercare-user')
    const savedRole = localStorage.getItem('silvercare-role')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setRole(savedRole)
    }
  }, [])

  /**
   * 인증 정보 저장
   */
  const saveAuthData = useCallback((userData, userToken, userRole) => {
    localStorage.setItem('silvercare-token', userToken)
    localStorage.setItem('silvercare-user', JSON.stringify(userData))
    if (userRole) {
      localStorage.setItem('silvercare-role', userRole)
    }
    setUser(userData)
    setToken(userToken)
    setRole(userRole)
  }, [])

  /**
   * 이메일/비번 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthApiClient.login(email, password)
      saveAuthData(response.user, response.accessToken, response.role)
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveAuthData])

  /**
   * 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {string} name - 이름
   * @param {string} userRole - 역할 (senior, guardian)
   */
  const signup = useCallback(async (email, password, name, userRole) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthApiClient.signup(email, password, name, userRole)
      saveAuthData(response.user, response.accessToken, userRole)
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveAuthData])

  /**
   * 카카오 로그인
   * @param {string} kakaoAccessToken - 카카오 액세스 토큰
   */
  const kakaoLogin = useCallback(async (kakaoAccessToken) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthApiClient.kakaoLogin(kakaoAccessToken)
      saveAuthData(response.user, response.accessToken, response.role)
    } catch (err) {
      setError(err.message || '카카오 로그인에 실패했습니다')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveAuthData])

  /**
   * 역할 선택
   * @param {string} selectedRole - 선택한 역할 (senior, guardian)
   */
  const selectRole = useCallback(async (selectedRole) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthApiClient.selectRole(token, selectedRole)
      setRole(selectedRole)
      localStorage.setItem('silvercare-role', selectedRole)
    } catch (err) {
      setError(err.message || '역할 선택에 실패했습니다')
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  /**
   * 로그아웃
   */
  const logout = useCallback(() => {
    setUser(null)
    setRole(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('silvercare-token')
    localStorage.removeItem('silvercare-user')
    localStorage.removeItem('silvercare-role')
  }, [])

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    role,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    signup,
    kakaoLogin,
    selectRole,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * @returns {AuthContextType} AuthContext 값
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}

export default AuthProvider

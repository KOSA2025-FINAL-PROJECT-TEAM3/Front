/**
 * useAuth Hook
 * - 인증 상태 관리 (로그인, 로그아웃, 토큰 관리)
 * - Zustand store와 연동
 */

import { useEffect } from 'react'
import { useAuthStore } from '@stores/authStore'
import Cookies from 'js-cookie'
import { STORAGE_KEYS } from '@config/constants'

/**
 * 인증 관련 상태와 메서드를 제공하는 커스텀 훅
 * @returns {Object} 인증 상태 및 메서드
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    setUser,
    setIsAuthenticated,
    logout: storeLogout,
  } = useAuthStore()

  /**
   * 컴포넌트 마운트 시 저장된 토큰으로 인증 상태 복구
   */
  useEffect(() => {
    const token = Cookies.get(STORAGE_KEYS.AUTH_TOKEN)
    if (token && !isAuthenticated) {
      // 토큰이 있으면 인증된 상태로 설정
      // 실제로는 토큰 검증을 위해 서버 호출 필요
      setIsAuthenticated(true)
    }
  }, [])

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    Cookies.remove(STORAGE_KEYS.AUTH_TOKEN)
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN)
    storeLogout()
  }

  /**
   * 토큰 가져오기
   */
  const getToken = () => {
    return Cookies.get(STORAGE_KEYS.AUTH_TOKEN)
  }

  /**
   * 토큰 설정
   */
  const setToken = (token) => {
    if (token) {
      Cookies.set(STORAGE_KEYS.AUTH_TOKEN, token)
      setIsAuthenticated(true)
    } else {
      Cookies.remove(STORAGE_KEYS.AUTH_TOKEN)
      setIsAuthenticated(false)
    }
  }

  /**
   * 로그인 처리 (사용자 정보 저장)
   */
  const login = (userData, token) => {
    setToken(token)
    setUser(userData)
  }

  return {
    isAuthenticated,
    user,
    getToken,
    setToken,
    login,
    logout,
  }
}

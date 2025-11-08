/**
 * Auth Store
 * - 전역 인증 상태 관리 (사용자 정보, 로그인 상태 등)
 * - Zustand로 구현
 */

import { create } from 'zustand'

/**
 * 인증 저장소 생성
 */
export const useAuthStore = create((set) => ({
  // 상태
  isAuthenticated: false,
  user: null,
  role: null,
  loading: false,
  error: null,

  // 액션: 사용자 정보 설정
  setUser: (user) =>
    set(() => ({
      user,
      role: user?.role || null,
    })),

  // 액션: 인증 상태 설정
  setIsAuthenticated: (isAuthenticated) =>
    set(() => ({
      isAuthenticated,
    })),

  // 액션: 로딩 상태 설정
  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  // 액션: 에러 설정
  setError: (error) =>
    set(() => ({
      error,
    })),

  // 액션: 로그아웃 (상태 초기화)
  logout: () =>
    set(() => ({
      isAuthenticated: false,
      user: null,
      role: null,
      error: null,
    })),

  // 액션: 에러 초기화
  clearError: () =>
    set(() => ({
      error: null,
    })),
}))

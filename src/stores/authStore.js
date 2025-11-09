/**
 * Auth Store
 * - 전역 인증 상태 관리 (사용자 정보, 로그인 상태 등)
 * - Zustand + localStorage persist
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const runtimeEnv = typeof import.meta !== 'undefined' ? import.meta.env : {}
const logMockStore = (action, payload) => {
  if (runtimeEnv?.DEV) {
    console.info(`[Mock AuthStore] ${action}`, payload)
  }
}

/**
 * 인증 저장소 생성
 * @typedef {Object} AuthStore
 * @property {boolean} isAuthenticated - 인증 여부
 * @property {Object|null} user - 사용자 정보
 * @property {string|null} role - 역할 (senior, guardian)
 * @property {string|null} token - JWT 토큰
 * @property {boolean} loading - 로딩 상태
 * @property {string|null} error - 에러 메시지
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      // 상태
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
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

      // 액션: JWT 토큰 설정
      setToken: (token) =>
        set(() => ({
          token,
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

      // 액션: 이메일/비번 로그인
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          // TODO: 실제 API 호출로 대체
          // const response = await loginApi(email, password)
          logMockStore('login', {
            email,
            passwordLength: password?.length || 0,
          })

          const userData = {
            id: '1',
            email,
            name: email.split('@')[0],
          }
          const dummyToken = 'jwt_token_' + Date.now()

          set({
            user: userData,
            token: dummyToken,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({
            error: error.message || '로그인에 실패했습니다',
            loading: false,
          })
          throw error
        }
      },

      // 액션: 회원가입
      signup: async (email, password, name, role) => {
        set({ loading: true, error: null })
        try {
          // TODO: 실제 API 호출로 대체
          // const response = await signupApi(email, password, name, role)
          logMockStore('signup', {
            email,
            passwordLength: password?.length || 0,
            role,
          })

          const userData = {
            id: '1',
            email,
            name,
          }
          const dummyToken = 'jwt_token_' + Date.now()

          set({
            user: userData,
            token: dummyToken,
            role,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({
            error: error.message || '회원가입에 실패했습니다',
            loading: false,
          })
          throw error
        }
      },

      // 액션: 카카오 로그인
      kakaoLogin: async (kakaoAccessToken) => {
        set({ loading: true, error: null })
        try {
          // TODO: 실제 API 호출로 대체
          // const response = await kakaoLoginApi(kakaoAccessToken)
          logMockStore('kakaoLogin', {
            tokenSuffix: kakaoAccessToken?.slice(-4),
          })

          const userData = {
            id: '1',
            email: 'user@kakao.com',
            name: '카카오 사용자',
          }
          const dummyToken = 'jwt_token_' + Date.now()

          set({
            user: userData,
            token: dummyToken,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({
            error: error.message || '카카오 로그인에 실패했습니다',
            loading: false,
          })
          throw error
        }
      },

      // 액션: 로그아웃 (상태 초기화)
      logout: () =>
        set(() => ({
          isAuthenticated: false,
          user: null,
          role: null,
          token: null,
          error: null,
        })),

      // 액션: 에러 초기화
      clearError: () =>
        set(() => ({
          error: null,
        })),
    }),
    {
      name: 'amapill-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

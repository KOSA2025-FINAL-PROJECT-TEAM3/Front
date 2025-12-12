import logger from '@core/utils/logger'

/**
 * Auth Store
 * - 전역 인증 상태 관리 (Zustand + localStorage persist)
 * - Context 없이도 동일 API 제공
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApiClient } from '@core/services/api/authApiClient'
import { STORAGE_KEYS } from '@config/constants'

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  userRole: null,
  customerRole: null,
  loading: false,
  error: null,
  _hasHydrated: false,  // Hydration 완료 플래그
}

const persistAuthToStorage = ({ user, token, refreshToken, customerRole }) => {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  if (refreshToken) {
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  }

  if (customerRole) {
    window.localStorage.setItem(STORAGE_KEYS.ROLE, customerRole)
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  }
}



const normalizeAuthPayload = (payload = {}) => {
  const {
    user,
    token,
    accessToken,
    refreshToken,
    role,
    userRole,
    customerRole,
    ...rest
  } = payload

  const resolvedUser = user ?? rest.userData ?? null
  const resolvedToken = token ?? accessToken ?? null
  const resolvedRefreshToken = refreshToken ?? null
  const resolvedUserRole = userRole ?? resolvedUser?.userRole ?? null
  const resolvedCustomerRole =
    customerRole ?? resolvedUser?.customerRole ?? role ?? resolvedUser?.role ?? null

  return {
    user: resolvedUser,
    token: resolvedToken,
    refreshToken: resolvedRefreshToken,
    userRole: resolvedUserRole,
    customerRole: resolvedCustomerRole,
  }
}

const normalizeSignupPayload = (args) => {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    return args[0]
  }

  const [email, password, name, role] = args
  return {
    email,
    password,
    name,
    customerRole: role,
    userRole: 'ROLE_USER',
  }
}

const withLoading = async (set, fn) => {
  set({ loading: true, error: null })
  try {
    return await fn()
  } catch (error) {
    const message = error?.message || '요청에 실패했습니다'
    set({ error: message })
    throw error
  } finally {
    set({ loading: false })
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setAuthData: (payload = {}) => {
        const normalized = normalizeAuthPayload(payload)
        persistAuthToStorage(normalized)

        set((state) => ({
          ...state,
          user: normalized.user,
          token: normalized.token,
          refreshToken: normalized.refreshToken,
          userRole: normalized.userRole,
          customerRole: normalized.customerRole,
          isAuthenticated: Boolean(normalized.user && normalized.token),
          _hasHydrated: true,  // 로그인 성공 후 항상 true
        }))
      },

      clearAuthState: () => {
        // 1. 먼저 모든 Auth 관련 localStorage 삭제
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
          window.localStorage.removeItem(STORAGE_KEYS.ROLE)
          window.localStorage.removeItem('amapill-auth-storage-v2')
        }

        // 2. Zustand 상태 초기화 (persist가 빈 상태 저장할 수 있음)
        set({ ...initialState, _hasHydrated: true })

        // 3. persist가 재생성한 키 최종 삭제 (확실한 정리)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('amapill-auth-storage-v2')
        }
      },

      clearError: () => set({ error: null }),

      login: async (email, password) =>
        withLoading(set, async () => {
          const response = await authApiClient.login(email, password)
          get().setAuthData(response)
        }),

      signup: async (...args) =>
        withLoading(set, async () => {
          const response = await authApiClient.signup(normalizeSignupPayload(args))
          get().setAuthData(response)
        }),

      kakaoLogin: async (authorizationCode) =>
        withLoading(set, async () => {
          const response = await authApiClient.kakaoLogin(authorizationCode)
          get().setAuthData(response)
        }),

      selectRole: async (selectedRole) =>
        withLoading(set, async () => {
          const token = get().token
          await authApiClient.selectRole(token, selectedRole)
          const user = get().user
          get().setAuthData({
            user: user ? { ...user, customerRole: selectedRole } : null,
            token,
            customerRole: selectedRole,
          })
        }),

      // Alias for selectRole (체크리스트 호환성)
      updateUserRole: async (selectedRole) => get().selectRole(selectedRole),

      logout: async () => {
        set({ loading: true, error: null })
        const token = get().token
        try {
          await authApiClient.logout(token)
        } catch (error) {
          logger.warn('로그아웃 요청 실패 (무시):', error)
        }
        // clearAuthState가 initialState(loading: false 포함)로 완전 리셋
        get().clearAuthState()
      },
    }),
    {
      name: 'amapill-auth-storage-v2',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        userRole: state.userRole,
        customerRole: state.customerRole,
        // isAuthenticated 제거 - hydration 시 재계산
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 저장된 상태가 있는 경우
          // Self-healing: Store를 Source of Truth로 간주하고 Raw Key 동기화
          if (state.token) {
            window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, state.token)
          }
          if (state.refreshToken) {
            window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken)
          }
          if (state.user) {
            window.localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user))
          }
          if (state.customerRole) {
            window.localStorage.setItem(STORAGE_KEYS.ROLE, state.customerRole)
          }
          state.isAuthenticated = Boolean(state.user && state.token)
          state._hasHydrated = true
        } else {
          // 저장된 상태가 없는 경우 (첫 방문 등)
          useAuthStore.setState({ _hasHydrated: true })
        }
      },
    },
  ),
)

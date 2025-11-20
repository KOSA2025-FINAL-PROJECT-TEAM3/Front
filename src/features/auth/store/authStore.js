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
  userRole: null,
  customerRole: null,
  loading: false,
  error: null,
}

const persistAuthToStorage = ({ user, token, customerRole }) => {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
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

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
}

const normalizeAuthPayload = (payload = {}) => {
  const {
    user,
    token,
    accessToken,
    role,
    userRole,
    customerRole,
    ...rest
  } = payload

  const resolvedUser = user ?? rest.userData ?? null
  const resolvedToken = token ?? accessToken ?? null
  const resolvedUserRole = userRole ?? resolvedUser?.userRole ?? null
  const resolvedCustomerRole =
    customerRole ?? resolvedUser?.customerRole ?? role ?? resolvedUser?.role ?? null

  return {
    user: resolvedUser,
    token: resolvedToken,
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
          userRole: normalized.userRole,
          customerRole: normalized.customerRole,
          isAuthenticated: Boolean(normalized.user && normalized.token),
        }))
      },

      clearAuthState: () => {
        clearAuthStorage()
        set({ ...initialState })
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

      logout: async () =>
        withLoading(set, async () => {
          const token = get().token
          try {
            await authApiClient.logout(token)
          } catch (error) {
            console.warn('로그아웃 요청 실패 (무시):', error)
          } finally {
            get().clearAuthState()
          }
        }),
    }),
    {
      name: 'amapill-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userRole: state.userRole,
        customerRole: state.customerRole,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

/**
 * Auth Store
 * - 전역 인증 상태 관리 (Zustand + localStorage persist)
 * - Context 없이도 동일 API 제공
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApiClient } from '@/core/services/api/authApiClient'
import { STORAGE_KEYS } from '@config/constants'

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  loading: false,
  error: null,
}

const persistAuthToStorage = (user, token, role) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }
  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
  }
  if (role) {
    window.localStorage.setItem(STORAGE_KEYS.ROLE, role)
  }
}

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
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

      setAuthData: ({ user, token, role }) => {
        persistAuthToStorage(user, token, role)
        set({
          user,
          token,
          role: role || user?.role || null,
          isAuthenticated: Boolean(user && token),
        })
      },

      clearAuthState: () => {
        clearAuthStorage()
        set({ ...initialState })
      },

      clearError: () => set({ error: null }),

      login: async (email, password) =>
        withLoading(set, async () => {
          const response = await authApiClient.login(email, password)
          const role = response.role || response.user?.role || null
          get().setAuthData({
            user: response.user,
            token: response.accessToken,
            role,
          })
        }),

      signup: async (email, password, name, role) =>
        withLoading(set, async () => {
          const response = await authApiClient.signup(email, password, name, role)
          get().setAuthData({
            user: response.user,
            token: response.accessToken,
            role,
          })
        }),

      kakaoLogin: async (authorizationCode) =>
        withLoading(set, async () => {
          const response = await authApiClient.kakaoLogin(authorizationCode)
          get().setAuthData({
            user: response.user,
            token: response.accessToken,
            role: response.role || response.user?.role || null,
          })
        }),

      selectRole: async (selectedRole) =>
        withLoading(set, async () => {
          const token = get().token
          await authApiClient.selectRole(token, selectedRole)
          const user = get().user
          get().setAuthData({
            user: user ? { ...user, role: selectedRole } : null,
            token,
            role: selectedRole,
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
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

/**
 * Auth Store
 * - ?꾩뿭 ?몄쬆 ?곹깭 愿由?(Zustand + localStorage persist)
 * - Context ?놁씠???숈씪 API ?쒓났
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApiClient } from '@core/services/api/authApiClient'
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
    const message = error?.message || '?붿껌???ㅽ뙣?덉뒿?덈떎'
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
            console.warn('濡쒓렇?꾩썐 ?붿껌 ?ㅽ뙣 (臾댁떆):', error)
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

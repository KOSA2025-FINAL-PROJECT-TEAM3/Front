import logger from '@core/utils/logger'

/**
 * Auth Store
 * - 전역 인증 상태 관리 (Zustand + localStorage persist)
 * - Context 없이도 동일 API 제공
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApiClient } from '@core/services/api/authApiClient'
import { userApiClient } from '@core/services/api/userApiClient'
import { STORAGE_KEYS } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

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

        // Safety Net: 사용자 변경 시(로그인, 계정전환) 기존 Feature Store 상태 초기화
        // 이유: 브라우저 종료 후 재접속 시 Auth는 없지만 Feature Store(persisted)는 남아있을 수 있음
        const currentUser = get().user
        const newUser = normalized.user

        // 1. 새로운 유저 로그인 (currentUser 없음 -> newUser 있음)
        // 2. 유저 변경 (currentUser A -> newUser B)
        // 주의: 리프레시나 역할 변경 시에는 id가 같으므로 트리거되지 않음
        if (newUser && (!currentUser || String(currentUser.id) !== String(newUser.id))) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('app:auth:logout'))
          }
        }

        set((state) => ({
          ...state,
          user: normalized.user,
          token: normalized.token,
          refreshToken: normalized.refreshToken,
          userRole: normalized.userRole,
          customerRole: normalizeCustomerRole(normalized.customerRole),
          isAuthenticated: Boolean(normalized.user && normalized.token),
          _hasHydrated: true,  // 로그인 성공 후 항상 true
        }))
      },

      clearAuthState: () => {
        // 1. 먼저 모든 Auth 관련 localStorage 삭제
        if (typeof window !== 'undefined') {
          // LocalStorage - 개별 키 삭제
          window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
          window.localStorage.removeItem(STORAGE_KEYS.ROLE)
          window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
          window.localStorage.removeItem(STORAGE_KEYS.FAMILY_GROUP)
          window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)
          window.localStorage.removeItem(STORAGE_KEYS.DIET_LOGS)
          window.localStorage.removeItem('amapill-auth-storage-v2')
          window.localStorage.removeItem('amapill-care-target-v1')

          // LocalStorage - amapill 관련 모든 키 삭제 (확장성)
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith('amapill')) {
              window.localStorage.removeItem(key)
            }
          })

          // SessionStorage - amapill 관련 모든 키 삭제
          Object.keys(window.sessionStorage).forEach(key => {
            if (key.startsWith('amapill')) {
              window.sessionStorage.removeItem(key)
            }
          })

          // Cookie - amapill 관련 쿠키 삭제
          document.cookie.split(';').forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim()
            if (cookieName.startsWith('amapill')) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            }
          })
        }

        // 2. Zustand 상태 초기화 (persist가 빈 상태 저장할 수 있음)
        set({ ...initialState, _hasHydrated: true })

        // 3. 글로벌 로그아웃 이벤트 발행 (다른 Store들이 구독하여 스스로 초기화)
        // Decoupled Architecture: AuthStore는 누가 무엇을 초기화하는지 몰라도 됨
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('app:auth:logout'))
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

      reactivate: async (token) =>
        withLoading(set, async () => {
          const response = await authApiClient.reactivate(token)
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

      updateUser: async (data) =>
        withLoading(set, async () => {
          let updatedUser = null

          // 1. 이미지가 있으면 먼저 업로드 (이미지 변경)
          if (data.profileImageFile) {
            const imageResponse = await userApiClient.uploadProfileImage(data.profileImageFile)
            // imageResponse가 user 객체를 반환한다고 가정 (백엔드 로직에 따름)
            updatedUser = imageResponse
          }

          // 2. 텍스트 정보 업데이트 (이름, 전화번호 등)
          // 이미지만 바꾼 경우 텍스트 업데이트 생략 가능하지만, 
          // 안전하게 텍스트 정보도 같이 보냄 (또는 data에서 file 제외하고 보냄)
          const { profileImageFile, ...textData } = data

          // 텍스트 데이터가 변경된 게 있으면 호출
          if (Object.keys(textData).length > 0) {
            updatedUser = await userApiClient.updateMe(textData)
          }

          // 기존 토큰 등은 유지하고 user 정보만 업데이트
          const currentUser = get().user
          // updatedUser가 없으면(둘 다 실행 안됨?) 기존 유지
          const finalUser = updatedUser || currentUser

          const newUserState = { ...currentUser, ...finalUser }

          get().setAuthData({
            ...get(), // 기존 토큰 및 상태 유지
            user: newUserState
          })
          return newUserState
        }),

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

      withdraw: async () =>
        withLoading(set, async () => {
          try {
            await userApiClient.deleteMe()
            get().clearAuthState()
          } catch (error) {
            logger.error('회원 탈퇴 실패:', error)
            throw error
          }
        }),
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
          const normalizedRole = normalizeCustomerRole(state.customerRole)
          state.isAuthenticated = Boolean(state.user && state.token && normalizedRole)
          state._hasHydrated = true
        } else {
          // 저장된 상태가 없는 경우 (첫 방문 등)
          useAuthStore.setState({ _hasHydrated: true })
        }
      },
    },
  ),
)
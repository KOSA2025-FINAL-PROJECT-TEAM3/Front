import axios from 'axios'
import { API_CONFIG } from '@config/api.config'
import { STORAGE_KEYS } from '@config/constants'

// 공개 엔드포인트 (토큰 없이 접근 가능)
const PUBLIC_ENDPOINTS = [
  '/api/invites/start', // 초대 링크 조회
  '/api/invites/accept', // 초대 수락
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/refresh', // 토큰 갱신
]

let store = null
let refreshPromise = null

const EXPIRY_SKEW_SECONDS = 30

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

const isJwtExpiredOrNearExpiry = (token, skewSeconds = EXPIRY_SKEW_SECONDS) => {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (!exp) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec + skewSeconds
}

const applyTokenToStore = (newToken, refreshToken) => {
  if (!store) return
  const state = store.getState?.() || {}
  const user = state.user || null
  const customerRole = state.customerRole || null
  const nextRefresh = refreshToken || state.refreshToken || null

  state.setAuthData?.({
    user,
    token: newToken,
    refreshToken: nextRefresh,
    customerRole,
  })
}

const logoutFallback = () => {
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  window.location.href = '/login'
}

const performRefresh = async () => {
  if (refreshPromise) return refreshPromise

  const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  if (!refreshToken) return null

  refreshPromise = (async () => {
    try {
      // Raw Axios로 갱신 요청 (인터셉터 무한 루프 방지)
      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const { accessToken: newToken, refreshToken: newRefreshToken } = response.data || {}
      if (!newToken) return null

      window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
      if (newRefreshToken) {
        window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
      }
      applyTokenToStore(newToken, newRefreshToken ?? refreshToken)
      return newToken
    } catch {
      // refresh 실패: 상위에서 logout 처리
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const injectStore = (_store) => {
  store = _store
}

export const attachAuthInterceptor = (axiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    async (config) => {
      if (typeof window === 'undefined') {
        return config
      }

      // 공개 엔드포인트는 토큰 추가 안 함
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
        config.url?.includes(endpoint),
      )
      if (isPublicEndpoint) {
        return config
      }

      let token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

      // JWT 만료(또는 임박) 시, 요청 전에 refresh 시도
      if (token && isJwtExpiredOrNearExpiry(token)) {
        const newToken = await performRefresh()
        token = newToken || null
      }

      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        return config
      }

      // 보호 리소스에 토큰이 없으면 즉시 로그아웃/로그인 이동
      if (store) {
        store.getState().logout?.()
      } else {
        logoutFallback()
      }

      return config
    },
    (error) => Promise.reject(error),
  )

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // 401 에러이고, 재시도하지 않은 요청이며, 로그인/갱신 요청이 아닌 경우
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/login') &&
        !originalRequest.url?.includes('/refresh') &&
        !originalRequest.url?.includes('/logout')
      ) {
        originalRequest._retry = true

        const newToken = await performRefresh()
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          originalRequest._authRefreshed = true
          return axiosInstance(originalRequest)
        }

        // 리프레시 토큰이 없거나 refresh 실패 시 로그아웃
        if (store) {
          store.getState().logout?.()
        } else {
          logoutFallback()
        }
      }

      return Promise.reject(error)
    },
  )
}

export default attachAuthInterceptor
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

export const injectStore = (_store) => {
  store = _store
}

export const attachAuthInterceptor = (axiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
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

      const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
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

        const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

        if (refreshToken) {
          try {
            // Raw Axios로 갱신 요청 (인터셉터 무한 루프 방지)
            const response = await axios.post(
              `${API_CONFIG.baseURL}/api/auth/refresh`,
              { refreshToken },
              {
                headers: { 'Content-Type': 'application/json' },
              },
            )

            const { accessToken: newToken, refreshToken: newRefreshToken } = response.data || {}

            if (newToken) {
              // 1. 스토리지 갱신 (Refresh Token 회전 대응)
              window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
              if (newRefreshToken) {
                window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
              }

              // 2. 스토어 상태 갱신 (소켓 재연결 등을 위해)
              if (store) {
                const current = store.getState()
                current.setAuthData({
                  user: current.user,
                  accessToken: newToken,
                  refreshToken: newRefreshToken ?? current.refreshToken,
                  customerRole: current.customerRole,
                  userRole: current.userRole,
                })
              }

              // 3. 실패했던 요청의 헤더 갱신 및 재시도
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            // 갱신 실패 시 로그아웃 처리
            if (store) {
              store.getState().logout()
            } else {
              window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
              window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
              window.location.href = '/login'
            }
          }
        } else {
            // 리프레시 토큰이 없으면 로그아웃
            if (store) {
                store.getState().logout()
            }
        }
      }

      return Promise.reject(error)
    },
  )
}

export default attachAuthInterceptor

import { STORAGE_KEYS } from '@config/constants'

// 공개 엔드포인트 (토큰 없이 접근 가능)
const PUBLIC_ENDPOINTS = [
  '/api/invites/start', // 초대 링크 조회
  '/api/invites/accept', // 초대 수락
  '/api/auth/signup',
  '/api/auth/login',
]

export const attachAuthInterceptor = (axiosInstance) =>
  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window === 'undefined') {
        return config
      }

      // 공개 엔드포인트는 토큰 추가 안 함
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint))
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

export default attachAuthInterceptor

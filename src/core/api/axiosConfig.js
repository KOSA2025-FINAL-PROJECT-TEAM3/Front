/**
 * Axios Configuration
 * - API 클라이언트 설정
 * - JWT 토큰 자동 추가
 */

import axios from 'axios'
import { STORAGE_KEYS } from '../../config/constants'

/**
 * API 클라이언트 생성
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 요청 인터셉터: JWT 토큰 자동 추가
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * 응답 인터셉터: 에러 처리
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료: 로그아웃
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      localStorage.removeItem(STORAGE_KEYS.ROLE)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

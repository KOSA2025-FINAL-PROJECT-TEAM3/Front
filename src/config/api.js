/**
 * API 설정 및 Axios 인스턴스
 * - 기본 URL 설정
 * - 요청/응답 인터셉터 (토큰 관리, 에러 처리)
 */

import axios from 'axios'
import { STORAGE_KEYS } from './constants'

const getStorageItem = (key) => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}

// 기본 API 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 요청 인터셉터
 * - 모든 요청에 Access Token 자동 추가
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getStorageItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * 응답 인터셉터
 * - 401 에러 처리 (토큰 갱신)
 * - 에러 메시지 정규화
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러 시 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getStorageItem(import.meta.env.VITE_REFRESH_TOKEN_KEY || STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          // 토큰 갱신 API 호출 (실제 엔드포인트는 백엔드에서 확인)
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          )

          const { accessToken } = response.data
          setStorageItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || STORAGE_KEYS.AUTH_TOKEN, accessToken)

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

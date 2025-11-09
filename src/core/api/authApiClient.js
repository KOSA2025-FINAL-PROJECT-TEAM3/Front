/**
 * AuthApiClient - 인증 관련 API 호출
 * - 명세서: "MedicationApiClient" 패턴 준수
 * - 실제 백엔드 연동용
 */

import { apiClient } from './axiosConfig'
import { STORAGE_KEYS } from '../../config/constants'

const runtimeEnv = typeof import.meta !== 'undefined' ? import.meta.env : {}
const USE_MOCK_API = runtimeEnv?.VITE_USE_MOCK_API === 'true'
const MOCK_DELAY_MS = 250

const delay = (ms = MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const buildMockToken = (prefix) => `${prefix}_${Date.now()}`
const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage
const buildAuthHeaders = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined

const logMockRequest = (label, payload) => {
  if (runtimeEnv?.DEV) {
    console.info(`[Mock AuthApiClient] ${label}`, payload)
  }
}

const isDevModeEnabled = () =>
  typeof window !== 'undefined' &&
  window.localStorage.getItem(STORAGE_KEYS.DEV_MODE) === 'true'

const shouldUseMock = () => USE_MOCK_API || isDevModeEnabled()

const requestOrMock = async ({ request, mock, fallbackMessage }) => {
  if (!shouldUseMock() && typeof request === 'function') {
    try {
      const response = await request()
      return response?.data ?? response
    } catch (error) {
      throw new Error(getErrorMessage(error, fallbackMessage))
    }
  }

  await delay()
  return typeof mock === 'function' ? mock() : mock
}

/**
 * 인증 API 클라이언트
 * @namespace AuthApiClient
 */
export const AuthApiClient = {
  /**
   * 이메일/비번 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} {user, accessToken, role}
   * @throws {Error} 로그인 실패
   */
  login: async (email, password) => {
    const payload = { email, password }
    const mock = () => {
      logMockRequest('login', { email, passwordLength: password?.length || 0 })
      return {
        user: {
          id: '1',
          email,
          name: email.split('@')[0],
        },
        accessToken: buildMockToken('accessToken'),
        role: null,
      }
    }

    return requestOrMock({
      request: () => apiClient.post('/api/auth/login', payload),
      mock,
      fallbackMessage: '로그인에 실패했습니다',
    })
  },

  /**
   * 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {string} name - 이름
   * @param {string} role - 역할 (senior, guardian)
   * @returns {Promise<Object>} {user, accessToken}
   * @throws {Error} 회원가입 실패
   */
  signup: async (email, password, name, role) => {
    const payload = { email, password, name, role }
    const mock = () => {
      logMockRequest('signup', {
        email,
        passwordLength: password?.length || 0,
        role,
      })
      return {
        user: {
          id: '1',
          email,
          name,
        },
        accessToken: buildMockToken('accessToken'),
      }
    }

    return requestOrMock({
      request: () => apiClient.post('/api/auth/signup', payload),
      mock,
      fallbackMessage: '회원가입에 실패했습니다',
    })
  },

  /**
   * 카카오 로그인
   * @param {string} authorizationCode - 카카오 OAuth authorization code
   * @returns {Promise<Object>} {user, accessToken, role}
   * @throws {Error} 카카오 로그인 실패
   */
  kakaoLogin: async (authorizationCode) => {
    const payload = { authorizationCode }
    const mock = () => {
      logMockRequest('kakaoLogin', { lastFour: authorizationCode?.slice(-4) })
      return {
        user: {
          id: '1',
          email: 'user@kakao.com',
          name: '카카오 사용자',
        },
        accessToken: buildMockToken('accessToken'),
        role: null,
      }
    }

    return requestOrMock({
      request: () => apiClient.post('/api/auth/kakao-login', payload),
      mock,
      fallbackMessage: '카카오 로그인에 실패했습니다',
    })
  },

  /**
   * 역할 선택
   * @param {string} token - JWT 토큰
   * @param {string} role - 선택한 역할 (senior, guardian)
   * @returns {Promise<Object>} {success: boolean}
   * @throws {Error} 역할 선택 실패
   */
  selectRole: async (token, role) => {
    const payload = { role }
    return requestOrMock({
      request: () =>
        apiClient.post('/api/auth/select-role', payload, buildAuthHeaders(token)),
      mock: () => {
        logMockRequest('selectRole', { tokenPresent: Boolean(token), role })
        return { success: true }
      },
      fallbackMessage: '역할 선택에 실패했습니다',
    })
  },

  /**
   * 로그아웃
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} {success: boolean}
   */
  logout: async (token) => {
    return requestOrMock({
      request: () =>
        apiClient.post('/api/auth/logout', {}, buildAuthHeaders(token)),
      mock: () => {
        logMockRequest('logout', { tokenPresent: Boolean(token) })
        return { success: true }
      },
      fallbackMessage: '로그아웃에 실패했습니다',
    }).catch(() => ({ success: true }))
  },
}

export default AuthApiClient

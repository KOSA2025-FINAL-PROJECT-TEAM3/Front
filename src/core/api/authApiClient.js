/**
 * AuthApiClient - 인증 관련 API 호출
 * - 명세서: "MedicationApiClient" 패턴 준수
 * - 실제 백엔드 연동용
 */

import { apiClient } from './axiosConfig'

/**
 * 인증 API 클라이언트
 * @namespace AuthApiClient
 */
export const AuthApiClient = {
  /**
   * 이메일/비번 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} {user, token, role}
   * @throws {Error} 로그인 실패
   */
  login: async (email, password) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await apiClient.post('/api/auth/login', { email, password })

      // 임시: 더미 데이터
      return {
        user: {
          id: '1',
          email,
          name: email.split('@')[0],
        },
        token: 'jwt_token_' + Date.now(),
        role: null,
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다')
    }
  },

  /**
   * 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {string} name - 이름
   * @param {string} role - 역할 (senior, guardian)
   * @returns {Promise<Object>} {user, token}
   * @throws {Error} 회원가입 실패
   */
  signup: async (email, password, name, role) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await apiClient.post('/api/auth/signup', {
      //   email,
      //   password,
      //   name,
      //   role,
      // })

      // 임시: 더미 데이터
      return {
        user: {
          id: '1',
          email,
          name,
        },
        token: 'jwt_token_' + Date.now(),
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다')
    }
  },

  /**
   * 카카오 로그인
   * @param {string} kakaoAccessToken - 카카오 액세스 토큰
   * @returns {Promise<Object>} {user, token, role}
   * @throws {Error} 카카오 로그인 실패
   */
  kakaoLogin: async (kakaoAccessToken) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await apiClient.post('/api/auth/kakao-login', {
      //   token: kakaoAccessToken,
      // })

      // 임시: 더미 데이터
      return {
        user: {
          id: '1',
          email: 'user@kakao.com',
          name: '카카오 사용자',
        },
        token: 'jwt_token_' + Date.now(),
        role: null,
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || '카카오 로그인에 실패했습니다')
    }
  },

  /**
   * 역할 선택
   * @param {string} token - JWT 토큰
   * @param {string} role - 선택한 역할 (senior, guardian)
   * @returns {Promise<Object>} {success: boolean}
   * @throws {Error} 역할 선택 실패
   */
  selectRole: async (token, role) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await apiClient.post('/api/auth/select-role', {
      //   role,
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })

      // 임시: 더미 데이터
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data?.message || '역할 선택에 실패했습니다')
    }
  },

  /**
   * 로그아웃
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} {success: boolean}
   */
  logout: async (token) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await apiClient.post('/api/auth/logout', {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })

      return { success: true }
    } catch (error) {
      // 로그아웃 실패해도 로컬 토큰 삭제
      return { success: true }
    }
  },
}

export default AuthApiClient

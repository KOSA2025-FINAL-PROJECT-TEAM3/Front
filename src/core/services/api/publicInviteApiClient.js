/**
 * 초대 공개 API 클라이언트 (비인증)
 * - PublicInviteController (/family/public/invites)
 */
import ApiClient from './ApiClient'

class PublicInviteApiClient extends ApiClient {
  constructor() {
    super({
      // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // Use default from ApiClient
      basePath: '/api/family/public/invites', // Correct base path for public invites
    })
  }

  /**
   * 초대 시작 (링크로 진입 시 사용)
   * @param {string} token - 긴 초대 토큰 (URL에서 전달)
   * @returns {Promise<{shortCode: string, suggestedRole: string, expiresAt?: string}>}
   */
  startInvite(token) {
    return this.get(`/start?token=${encodeURIComponent(token)}`)
  }

  /**
   * 초대 정보 조회 (초대 코드로 조회)
   * @param {string} code - 짧은 초대 코드 (6자리)
   * @returns {Promise<{shortCode: string, suggestedRole: string, groupName: string, inviterName: string, expiresAt?: string}>}
   */
  getInviteInfo(code) {
    return this.get(`/info?code=${encodeURIComponent(code)}`)
  }
}

export const publicInviteApiClient = new PublicInviteApiClient()
export { PublicInviteApiClient }

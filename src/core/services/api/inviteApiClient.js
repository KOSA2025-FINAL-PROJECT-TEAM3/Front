/**
 * 초대 공개 API 클라이언트 (비인증)
 * - PublicInviteController (/invites)
 */
import ApiClient from './ApiClient'

class InviteApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
      basePath: '/api/family/public/invites',
    })
  }

  /**
   * 초대 코드로 초대 정보 조회 (공개 API)
   * @param {string} code - 6자리 초대 코드
   */
  getInviteInfo(code) {
    return this.get(`/info?code=${encodeURIComponent(code)}`)
  }

  /**
   * 초대 시작 (링크로 진입 시 사용)
   * @param {string} token - 긴 초대 토큰 (URL에서 전달)
   * @returns {Promise<{shortCode: string, suggestedRole: string, expiresAt?: string}>}
   */
  startInvite(token) {
    return this.get(`/start?token=${encodeURIComponent(token)}`)
  }
}

export const inviteApiClient = new InviteApiClient()
export { InviteApiClient }

/**
 * 공개 초대 API 클라이언트
 * - 인증 없이 접근 가능한 초대 관련 API
 * - 백엔드: PublicInviteController (/invite)
 */
import ApiClient from './ApiClient'

class InviteApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
      basePath: '/invite',
    })
  }

  /**
   * 초대 코드로 초대 정보 조회 (공개 API)
   * @param {string} code - 6자리 초대 코드
   * @returns {Promise<{
   *   shortCode: string,
   *   groupName: string,
   *   groupId: number,
   *   inviterName: string,
   *   inviterEmail: string,
   *   suggestedRole: 'SENIOR' | 'CAREGIVER',
   *   expiresAt: string
   * }>}
   */
  getInviteInfo(code) {
    return this.get(`/info?code=${encodeURIComponent(code)}`)
  }

  /**
   * 초대 시작 (긴 토큰으로 접근 시)
   * @param {string} token - 긴 초대 토큰 (URL에서 전달)
   * @returns {Promise<{shortCode: string, ...}>}
   */
  startInvite(token) {
    return this.get(`/start?token=${encodeURIComponent(token)}`)
  }
}

export const inviteApiClient = new InviteApiClient()
export { InviteApiClient }

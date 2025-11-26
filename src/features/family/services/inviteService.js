import { httpClient } from '@core/services/api/httpClient'

const API_BASE = '/api/family'

export const inviteService = {
  /**
   * 가족 초대 생성
   * @param {number} groupId - 가족 그룹 ID
   * @param {string} email - 초대받을 이메일
   * @param {string} role - 역할 (SENIOR | CAREGIVER)
   * @returns {Promise<{shortCode: string, longToken: string, expiresAt: string}>}
   */
  createInvite: async (groupId, email, role) => {
    const response = await httpClient.post(`${API_BASE}/invites`, {
      groupId,
      email,
      suggestedRole: role
    })
    return response.data
  },

  /**
   * 초대 수락
   * @param {string} shortCode - 6자리 초대 코드
   * @returns {Promise<{memberId: number, groupId: number, role: string}>}
   */
  acceptInvite: async (shortCode) => {
    const response = await httpClient.post(`${API_BASE}/invites/accept`, {
      shortCode
    })
    return response.data
  },

  /**
   * 초대 링크 시작 (공개 엔드포인트)
   * @param {string} token - long token
   * @returns {Promise<{shortCode: string, suggestedRole: string}>}
   */
  startInvite: async (token) => {
    const response = await httpClient.get(`/api/invites/start?token=${token}`)
    return response.data
  }
}

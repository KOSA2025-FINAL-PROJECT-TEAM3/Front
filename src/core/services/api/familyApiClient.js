import ApiClient from './ApiClient'

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8090',
      basePath: '/api/family',
    })
  }

  getSummary() {
    return this.get('/')
  }

  getInvites() {
    return this.get('/invites')
  }

  inviteMember(payload) {
    return this.post('/invite', payload)
  }

  acceptInvite(inviteCode) {
    return this.post('/invite/accept', { inviteCode })
  }

  /**
   * 초대 코드 유효성 검증 및 초대 정보 조회
   * @param {string} inviteCode - 6자리 초대 코드
   * @returns {Promise<{groupName: string, inviterName: string, suggestedRole: string, expiresAt: string}>}
   */
  validateInviteCode(inviteCode) {
    return this.get(`/invite/validate?code=${encodeURIComponent(inviteCode)}`)
  }

  cancelInvite(inviteId) {
    return this.delete(`/invites/${inviteId}`)
  }

  removeMember(memberId) {
    return this.delete(`/members/${memberId}`)
  }
}

export const familyApiClient = new FamilyApiClient()
export { FamilyApiClient }

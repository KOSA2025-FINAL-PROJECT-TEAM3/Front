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

  /**
   * 초대 수락 (인증 필요)
   * @param {string} inviteCode - 6자리 초대 코드
   * @returns {Promise<AcceptInviteResponse>}
   */
  acceptInvite(inviteCode) {
    return this.post('/invite/accept', { inviteCode })
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

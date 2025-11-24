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

  cancelInvite(inviteId) {
    return this.delete(`/invites/${inviteId}`)
  }

  removeMember(memberId) {
    return this.delete(`/members/${memberId}`)
  }
}

export const familyApiClient = new FamilyApiClient()
export { FamilyApiClient }

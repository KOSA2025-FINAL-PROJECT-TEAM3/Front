import ApiClient from './ApiClient'
import {
  DEFAULT_FAMILY_GROUP,
  DEFAULT_FAMILY_MEMBERS,
} from '@/data/mockFamily'

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8090',
      basePath: '/api/family',
    })
  }

  getSummary() {
    return this.get('/', undefined, {
      mockResponse: () => ({
        group: DEFAULT_FAMILY_GROUP,
        members: DEFAULT_FAMILY_MEMBERS,
      }),
    })
  }

  inviteMember(payload) {
    return this.post('/invite', payload, undefined, {
      mockResponse: () => ({
        success: true,
        member: {
          id: `invite-${Date.now()}`,
          ...payload,
        },
      }),
    })
  }

  removeMember(memberId) {
    return this.delete(`/members/${memberId}`, undefined, {
      mockResponse: () => ({ success: true, memberId }),
    })
  }
}

export const familyApiClient = new FamilyApiClient()
export { FamilyApiClient }

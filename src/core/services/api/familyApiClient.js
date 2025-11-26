import ApiClient from './ApiClient'

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8082',
      basePath: '/api/family',
    })
  }

  getSummary() {
    // GET /api/family/groups에서 첫 번째 그룹을 기본 그룹으로 사용
    // 추후 백엔드에 getSummary 엔드포인트가 추가되면 변경 가능
    return this.get('/groups').then((groups) => {
      if (Array.isArray(groups) && groups.length > 0) {
        const firstGroup = groups[0]
        console.log('[familyApiClient] getSummary - firstGroup:', firstGroup)
        
        // 첫 번째 그룹을 기본 그룹으로 반환
        // 백엔드는 그룹 안에 members 배열을 포함해서 반환함
        return {
          group: firstGroup,
          members: firstGroup?.members || []
        }
      }
      // 그룹이 없으면 null 반환
      return {
        group: null,
        members: []
      }
    })
  }

  createGroup(name) {
    return this.post('/groups', { name })
  }

  getInvites() {
    return this.get('/invites')
  }

  inviteMember(payload) {
    const suggestedRole = payload.suggestedRole || payload.role
    const body = { ...payload, suggestedRole }
    return this.post('/invites', body).then((data) => ({
      ...data,
      inviteCode: data?.shortCode,
      inviteeEmail: body.email,
      suggestedRole,
    }))
  }

  /**
   * 초대 수락 (인증 필요)
   * @param {string} shortCode - 6자리 초대 코드
   * @returns {Promise<AcceptInviteResponse>}
   */
  acceptInvite(shortCode) {
    return this.post('/invites/accept', { shortCode })
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

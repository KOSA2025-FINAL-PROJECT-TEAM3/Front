import ApiClient from './ApiClient'

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8080',
      basePath: '/api/family',  // ★ 수정됨
    })
  }

  getSummary() {
    // GET /api/family/groups에서 첫 번째 그룹을 기본 그룹으로 사용
    // 추후 백엔드에 getSummary 엔드포인트가 추가되면 변경 가능
    return this.get('/groups').then((groups) => {
      if (Array.isArray(groups) && groups.length > 0) {
        const firstGroup = groups[0]
        console.log('[familyApiClient] getSummary - raw firstGroup:', firstGroup)

        const normalizeMember = (member) => {
          const userId =
            member?.user?.id ??
            member?.userId ??
            (typeof member?.id === 'number' ? member.id : null)

          return {
            id: member?.id?.toString() ?? member?.userId?.toString(),
            userId,
            name: member?.user?.name || member?.userName || '이름 없음',
            email: member?.user?.email || member?.userEmail || '',
            role: member?.familyRole || member?.user?.customerRole || member?.userRole || 'SENIOR',
            joinedAt: member?.joinedAt || new Date().toISOString(),
            raw: member,
          }
        }

        const members = Array.isArray(firstGroup?.members)
          ? firstGroup.members.map(normalizeMember)
          : []

        const normalizedGroup = {
          id: firstGroup?.id,
          name: firstGroup?.name,
          createdBy: firstGroup?.createdBy?.id ?? firstGroup?.createdBy,
          createdAt: firstGroup?.createdAt,
        }

        return {
          group: normalizedGroup,
          members,
        }
      }
      // 그룹이 없으면 null 반환
      return {
        group: null,
        members: [],
      }
    })
  }

  createGroup(name) {
    return this.post('/groups', { name })
  }

  deleteGroup(groupId) {
    return this.delete(`/groups/${groupId}`)
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

import ApiClient from './ApiClient'

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8080',
      basePath: '/api/family',  // ★ 수정됨
    })
  }

  getSummary() {
    // GET /api/family/groups에서 모든 그룹과 멤버 정보 반환
    return this.get('/groups').then((groups) => {
      if (Array.isArray(groups) && groups.length > 0) {
        console.log('[familyApiClient] getSummary - raw groups:', groups)

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

        // 모든 그룹을 정규화하고 members 포함
        const normalizedGroups = groups.map((group) => ({
          id: group?.id,
          name: group?.name,
          createdBy: group?.createdBy?.id ?? group?.createdBy,
          createdAt: group?.createdAt,
          members: Array.isArray(group?.members)
            ? group.members.map(normalizeMember)
            : [],
        }))

        // 첫 번째 그룹의 members를 기본값으로 (하위 호환성)
        const firstGroupMembers = normalizedGroups[0]?.members || []

        return {
          groups: normalizedGroups,  // 모든 그룹 반환
          members: firstGroupMembers, // 첫 번째 그룹 멤버 (하위 호환성)
        }
      }
      // 그룹이 없으면 빈 배열 반환
      return {
        groups: [],
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

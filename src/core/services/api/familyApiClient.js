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
    return this.post('/groups', { name }).then((group) => {
      // Normalize the created group to match getSummary structure
      return {
        id: group?.id,
        name: group?.name,
        createdBy: group?.createdBy?.id ?? group?.createdBy,
        createdAt: group?.createdAt,
        members: Array.isArray(group?.members)
          ? group.members.map((member) => ({
            id: member?.id?.toString() ?? member?.userId?.toString(),
            userId: member?.user?.id ?? member?.userId ?? (typeof member?.id === 'number' ? member.id : null),
            name: member?.user?.name || member?.userName || '이름 없음',
            email: member?.user?.email || member?.userEmail || '',
            role: member?.familyRole || member?.user?.customerRole || member?.userRole || 'SENIOR',
            joinedAt: member?.joinedAt || new Date().toISOString(),
            raw: member,
          }))
          : [],
      }
    })
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

  /**
   * 가족 구성원의 약 목록 조회
   * @param {number} userId - 조회 대상 사용자 ID
   * @returns {Promise}
   */
  getMemberMedications(userId) {
    return this.get(`/members/${userId}/medications`)
  }

  /**
   * 가족 구성원의 복약 로그 조회
   * @param {number} userId - 조회 대상 사용자 ID
   * @param {Object} options - 옵션
   * @param {string} options.date - 특정 날짜 (YYYY-MM-DD)
   * @param {string} options.status - 상태 필터 (completed, missed, pending)
   * @param {number} options.limit - 조회 개수 (default: 30)
   * @returns {Promise}
   */
  getMedicationLogs(userId, options = {}) {
    const params = new URLSearchParams()
    if (options.date) params.append('date', options.date)
    if (options.status) params.append('status', options.status)
    if (options.limit) params.append('limit', options.limit)

    const query = params.toString()
    const url = `/members/${userId}/medications/logs${query ? `?${query}` : ''}`
    return this.get(url)
  }

  /**
   * 가족 구성원의 약 세부 정보 조회
   * @param {number} userId - 조회 대상 사용자 ID
   * @param {number} medicationId - 약 ID
   * @returns {Promise}
   */
  getMedicationDetail(userId, medicationId) {
    return this.get(`/members/${userId}/medications/${medicationId}`)
  }

  /**
   * 가족 구성원 알림 설정 조회
   * @param {number} groupId - 가족 그룹 ID
   * @param {number} memberId - 대상 구성원 ID
   * @returns {Promise}
   */
  getMemberNotificationSettings(groupId, memberId) {
    return this.get(`/${groupId}/members/${memberId}/notification-settings`)
  }

  /**
   * 가족 구성원 알림 설정 수정
   * @param {number} groupId - 가족 그룹 ID
   * @param {number} memberId - 대상 구성원 ID
   * @param {Object} settings - 설정 값
   * @returns {Promise}
   */
  updateMemberNotificationSettings(groupId, memberId, settings) {
    return this.put(`/${groupId}/members/${memberId}/notification-settings`, settings)
  }
}

export const familyApiClient = new FamilyApiClient()
export { FamilyApiClient }

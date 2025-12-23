import ApiClient from './ApiClient'
import logger from '@core/utils/logger'
import envConfig from '@config/environment.config'
import { USER_ROLES } from '@config/constants'

const normalizeFamilyRole = (role) => {
  const raw = role == null ? '' : String(role)
  const upper = raw.trim().toUpperCase()
  if (!upper) return USER_ROLES.SENIOR
  if (upper === 'PARENT' || upper === 'ELDER' || upper === 'ELDERLY') return USER_ROLES.SENIOR
  if (upper === 'CHILD' || upper === 'GUARDIAN') return USER_ROLES.CAREGIVER
  if (upper === USER_ROLES.SENIOR || upper === USER_ROLES.CAREGIVER) return upper
  return upper
}

const normalizeInvite = (invite) => {
  if (!invite) return invite

  const shortCode =
    invite.shortCode || invite.inviteCode || invite.invite_code || invite.short_code || null
  const inviteUrl =
    invite.inviteUrl || invite.inviteLink || invite.invite_link || invite.link || null
  const longToken = invite.longToken || invite.long_token || invite.token || null

  return {
    ...invite,
    shortCode: invite.shortCode || shortCode,
    inviteCode: invite.inviteCode || shortCode,
    inviteUrl,
    longToken,
  }
}

const normalizeInvitesResponse = (data) => {
  if (!data) return data
  if (Array.isArray(data)) {
    return data.map((invite) => normalizeInvite(invite))
  }

  return {
    ...data,
    sent: Array.isArray(data.sent) ? data.sent.map(normalizeInvite) : data.sent,
    received: Array.isArray(data.received) ? data.received.map(normalizeInvite) : data.received,
  }
}

class FamilyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.FAMILY_API_URL || envConfig.API_BASE_URL,
      basePath: '/api/family',  // ★ 수정됨
    })
  }

  getSummary() {
    // GET /api/family/groups에서 모든 그룹과 멤버 정보 반환
    return this.get('/groups').then((groups) => {
      if (Array.isArray(groups) && groups.length > 0) {
        logger.debug('[familyApiClient] getSummary - raw groups:', groups)

        const normalizeMember = (member) => {
          // Backend 응답에서 member.id는 FamilyMember ID, member.user.id가 실제 User ID임.
          const userId = member?.user?.id ?? member?.userId ?? null

          return {
            id: member?.id?.toString() ?? member?.userId?.toString(),
            userId,
            name: member?.user?.name || member?.userName || '이름 없음',
            email: member?.user?.email || member?.userEmail || '',
            role: normalizeFamilyRole(member?.familyRole || member?.user?.customerRole || member?.userRole),
            joinedAt: member?.joinedAt || new Date().toISOString(),
            raw: member,
          }
        }

        // 모든 그룹을 정규화하고 members 포함
        const normalizedGroups = groups.map((group) => ({
          id: group?.id,
          name: group?.name,
          createdBy: group?.createdBy?.id ?? group?.createdBy,
          ownerId: group?.ownerId, // 현재 소유자 ID (양도 가능)
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

  createGroup(name, familyRole = null) {
    const body = { name }
    if (familyRole) {
      body.familyRole = familyRole
    }
    return this.post('/groups', body).then((group) => {
      // Normalize the created group to match getSummary structure
      return {
        id: group?.id,
        name: group?.name,
        createdBy: group?.createdBy?.id ?? group?.createdBy,
        ownerId: group?.ownerId, // 현재 소유자 ID (양도 가능)
        createdAt: group?.createdAt,
        members: Array.isArray(group?.members)
          ? group.members.map((member) => ({
            id: member?.id?.toString() ?? member?.userId?.toString(),
            // Backend 응답에서 member.id는 FamilyMember ID, member.user.id가 실제 User ID임.
            userId: member?.user?.id ?? member?.userId ?? null,
            name: member?.user?.name || member?.userName || '이름 없음',
            email: member?.user?.email || member?.userEmail || '',
            role: normalizeFamilyRole(member?.familyRole || member?.user?.customerRole || member?.userRole),
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

  /**
   * 멤버 역할 변경
   * @param {number} memberId - 멤버 ID
   * @param {string} familyRole - 새 역할 (SENIOR or CAREGIVER)
   * @param {number|null} newOwnerMemberId - 소유자 위임 시 새 소유자 멤버 ID
   * @returns {Promise}
   */
  updateMemberRole(memberId, familyRole, newOwnerMemberId = null) {
    const body = { familyRole }
    if (newOwnerMemberId) {
      body.newOwnerMemberId = newOwnerMemberId
    }
    return this.put(`/members/${memberId}/role`, body)
  }

  updateInvite(inviteId, payload) {
    return this.put(`/invites/${inviteId}`, payload)
  }

  getInvites(groupId) {
    const query = groupId ? `?groupId=${groupId}` : ''
    return this.get(`/invites${query}`).then((data) => normalizeInvitesResponse(data))
  }

  inviteMember(payload) {
    const suggestedRole = payload.suggestedRole || payload.role
    const body = { ...payload, suggestedRole }
    return this.post('/invites', body).then((data) => {
      const normalized = normalizeInvite(data)
      return {
        ...normalized,
        inviteCode: normalized?.inviteCode || data?.shortCode,
        inviteeEmail: normalized?.inviteeEmail || body.email,
        suggestedRole: normalized?.suggestedRole || suggestedRole,
      }
    })
  }

  /**
   * 초대 수락 (인증 필요)
   * @param {string|object} codeOrToken - 6자리 초대 코드 (string) 또는 { token, shortCode } 객체
   * @returns {Promise<AcceptInviteResponse>}
   */
  acceptInvite(codeOrToken) {
    if (typeof codeOrToken === 'string') {
      return this.post('/invites/accept', { shortCode: codeOrToken })
    }
    // { token: "...", shortCode: "..." }
    return this.post('/invites/accept', codeOrToken)
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
    if (options.startDate) params.append('startDate', options.startDate)
    if (options.endDate) params.append('endDate', options.endDate)
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

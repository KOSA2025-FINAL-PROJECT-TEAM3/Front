import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class FamilyChatApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.CHAT_API_URL || envConfig.API_BASE_URL,
      basePath: '/api/family-chat',
    })
  }

  // async getRoomByFamilyGroupId(familyGroupId) {
  //   return this.get(`/rooms/by-family/${familyGroupId}`)
  // }

  async getMessages(familyGroupId, page = 0, size = 50) {
    return this.get(`/rooms/${familyGroupId}/messages`, { params: { page, size } })
  }

  /**
   * 초기 채팅방 데이터 로딩 (메시지 + 사용자의 마지막 읽은 위치)
   * @param {number} familyGroupId 
   * @param {number} familyMemberId 
   */
  async getInitialChatRoomData(familyGroupId, familyMemberId) {
    return this.get(`/rooms/${familyGroupId}/init`, { params: { familyMemberId } });
  }

  async postMessage(familyGroupId, payload) {
    return this.post(`/rooms/${familyGroupId}/messages`, payload)
  }

  async uploadImage(familyGroupId, formData) {
    // [FIX] this.api.post -> this.post로 변경하여 ApiClient의 메서드 활용
    return this.post(`/rooms/${familyGroupId}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // [GEMINI] 가족 그룹 채팅방의 총 안 읽은 메시지 개수 조회
  async getUnreadCount(familyGroupId, familyMemberId) {
    return this.get(`/rooms/${familyGroupId}/unread-count`, { params: { familyMemberId } });
  }

  // [GEMINI] 특정 사용자가 속한 모든 가족 그룹 조회
  async getFamilyGroups() {
    // FamilyController의 /family/groups API를 직접 호출
    // 이 API는 userId를 SecurityContext에서 가져오므로 userId 파라미터는 제거해도 됨.
    return this.api.get('/api/family/groups');
  }

   // [GEMINI-CLI: 2025-11-29] 백엔드 API 삭제로 인한 주석 처리 (가족 생성 시 자동 처리됨)
  /*
  async createOrUpdateRoom(payload) {
    return this.post('/rooms', payload)
  }
  */

  // async getMembers(familyGroupId) {
  //   return this.get(`/rooms/${familyGroupId}/members`)
  // }

  // async addMember(familyGroupId, payload) {
  //   return this.post(`/rooms/${familyGroupId}/members`, payload)
  // }

  // async removeMember(familyGroupId, familyMemberId) {
  //   return this.delete(`/rooms/${familyGroupId}/members/${familyMemberId}`)
  // }
}

export const familyChatApiClient = new FamilyChatApiClient()
export default FamilyChatApiClient


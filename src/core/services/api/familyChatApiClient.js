import ApiClient from './ApiClient'

class FamilyChatApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8080',
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
    // 이미지 업로드 (Multipart)
    // ApiClient의 post 메소드는 기본적으로 JSON을 가정하므로, 
    // Content-Type 헤더를 삭제하여 브라우저가 자동으로 boundary를 설정하게 해야 함
    // 하지만 현재 ApiClient 구조상 headers를 덮어쓰기 어려울 수 있음.
    // 따라서 여기서는 axios나 fetch를 직접 사용하거나, ApiClient를 확장해야 함.
    // 가장 안전한 방법: instance(axios) 직접 사용
    return this.api.post(`${this.basePath}/rooms/${familyGroupId}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data) // axios response.data 반환
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



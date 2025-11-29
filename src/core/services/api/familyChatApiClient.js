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

  async postMessage(familyGroupId, payload) {
    return this.post(`/rooms/${familyGroupId}/messages`, payload)
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



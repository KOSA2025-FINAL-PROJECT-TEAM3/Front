import ApiClient from './ApiClient'

class FamilyChatApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8080',
      basePath: '/api/chat',   // ★ 수정됨
    })
  }

  async getRoomByFamilyGroupId(familyGroupId) {
    return this.get(`/rooms/by-family/${familyGroupId}`)
  }

  async getMessages(roomId, page = 0, size = 50) {
    return this.get(`/rooms/${roomId}/messages`, { params: { page, size } })
  }

  async postMessage(roomId, payload) {
    return this.post(`/rooms/${roomId}/messages`, payload)
  }

  async createOrUpdateRoom(payload) {
    return this.post('/rooms', payload)
  }

  async getMembers(roomId) {
    return this.get(`/rooms/${roomId}/members`)
  }

  async addMember(roomId, payload) {
    return this.post(`/rooms/${roomId}/members`, payload)
  }

  async removeMember(roomId, familyMemberId) {
    return this.delete(`/rooms/${roomId}/members/${familyMemberId}`)
  }
}

export const familyChatApiClient = new FamilyChatApiClient()
export default FamilyChatApiClient

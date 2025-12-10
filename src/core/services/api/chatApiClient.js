import ApiClient from './ApiClient'

/**
 * Chat API Client
 * 의사/AI 챗봇과의 1:1 실시간 채팅 기능을 위한 REST API 클라이언트
 *
 * WebSocket 연결은 별도로 처리되며, 이 클라이언트는:
 * - 채팅방 목록 조회
 * - 메시지 히스토리 로드
 * - REST fallback 메시지 전송
 */
class ChatApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8082',
      basePath: '/api/chat',
    })
  }

  /**
   * 채팅방 목록 조회
   * @returns {Promise<ChatRoomListResponse>}
   */
  async getRooms() {
    return this.get('/rooms')
  }

  /**
   * 특정 채팅방의 메시지 히스토리 조회
   * @param {string} roomId - 채팅방 ID
   * @param {Object} options - { limit?: number, before?: string }
   * @returns {Promise<ChatMessagesResponse>}
   */
  async getMessages(roomId, options = {}) {
    const { limit = 50, before } = options
    return this.get(`/rooms/${roomId}/messages`, { params: { limit, before } })
  }

  /**
   * 메시지 전송 (REST fallback, WebSocket이 우선)
   * @param {string} roomId - 채팅방 ID
   * @param {string} content - 메시지 내용
   * @returns {Promise<ChatMessage>}
   */
  async sendMessage(roomId, content) {
    return this.post(`/rooms/${roomId}/messages`, { content })
  }

  /**
   * 새 채팅방 생성 (의사/AI 챗봇 선택)
   * @param {string} counselorId - 의사 또는 AI 챗봇 ID
   * @param {string} type - 'doctor' | 'ai_bot'
   * @returns {Promise<ChatRoom>}
   */
  async createRoom(counselorId, type = 'doctor') {
    return this.post('/rooms', { counselorId, type })
  }

  /**
   * 메시지 읽음 처리
   * @param {string} roomId - 채팅방 ID
   * @param {string} messageId - 메시지 ID
   * @returns {Promise<void>}
   */
  async markAsRead(roomId, messageId) {
    return this.patch(`/rooms/${roomId}/messages/${messageId}/read`)
  }

  /**
   * 채팅방 나가기
   * @param {string} roomId - 채팅방 ID
   * @returns {Promise<void>}
   */
  async leaveRoom(roomId) {
    return this.delete(`/rooms/${roomId}`)
  }
}

export const chatApiClient = new ChatApiClient()
export { ChatApiClient }
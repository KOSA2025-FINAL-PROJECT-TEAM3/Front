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
    super({ basePath: '/api/chat' })
  }

  /**
   * 채팅방 목록 조회
   * @returns {Promise<ChatRoomListResponse>}
   */
  async getRooms() {
    const mockResponse = () => ({
      rooms: [
        {
          roomId: 'room_001',
          counselor: {
            id: 'doctor_001',
            name: '김의사',
            type: 'doctor', // 'doctor' | 'ai_bot'
            profileImage: 'https://via.placeholder.com/100',
            hospitalName: '서울대병원',
            specialty: '내과',
            isOnline: true,
          },
          lastMessage: {
            messageId: 'msg_123',
            content: '혈압약은 저녁 식사 후에 복용하시면 됩니다.',
            senderId: 'doctor_001',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
            isRead: true,
          },
          unreadCount: 0,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3일 전
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          roomId: 'room_002',
          counselor: {
            id: 'ai_bot_001',
            name: 'AMA AI 챗봇',
            type: 'ai_bot',
            profileImage: 'https://via.placeholder.com/100',
            hospitalName: null,
            specialty: '건강 상담',
            isOnline: true,
          },
          lastMessage: {
            messageId: 'msg_456',
            content: '안녕하세요! 약물 복용에 대해 무엇이든 물어보세요.',
            senderId: 'ai_bot_001',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
            isRead: false,
          },
          unreadCount: 2,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7일 전
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ],
      totalCount: 2,
    })

    return this.get('/rooms', {}, { mockResponse })
  }

  /**
   * 특정 채팅방의 메시지 히스토리 조회
   * @param {string} roomId - 채팅방 ID
   * @param {Object} options - { limit?: number, before?: string }
   * @returns {Promise<ChatMessagesResponse>}
   */
  async getMessages(roomId, options = {}) {
    const { limit = 50, before } = options

    const mockResponse = () => ({
      roomId,
      messages: [
        {
          messageId: 'msg_001',
          roomId,
          senderId: 'user_12345',
          senderType: 'user', // 'user' | 'pharmacist'
          content: '안녕하세요, 복용 중인 약에 대해 궁금한 게 있어요.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
          isRead: true,
        },
        {
          messageId: 'msg_002',
          roomId,
          senderId: 'doctor_001',
          senderType: 'counselor',
          content: '네, 말씀하세요. 어떤 부분이 궁금하신가요?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
          isRead: true,
        },
        {
          messageId: 'msg_003',
          roomId,
          senderId: 'user_12345',
          senderType: 'user',
          content: '혈압약을 아침에 먹어야 하나요, 저녁에 먹어야 하나요?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23 + 1000 * 60 * 5).toISOString(),
          isRead: true,
        },
        {
          messageId: 'msg_004',
          roomId,
          senderId: 'doctor_001',
          senderType: 'counselor',
          content: '혈압약은 보통 저녁 식사 후에 복용하는 것을 권장합니다. 잠들기 전에 혈압이 높아지는 것을 방지할 수 있기 때문입니다.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
          isRead: true,
        },
        {
          messageId: 'msg_005',
          roomId,
          senderId: 'user_12345',
          senderType: 'user',
          content: '감사합니다! 도움이 많이 되었어요.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22 + 1000 * 60 * 2).toISOString(),
          isRead: true,
        },
      ],
      hasMore: false,
      nextCursor: null,
    })

    return this.get(`/rooms/${roomId}/messages`, { params: { limit, before } }, { mockResponse })
  }

  /**
   * 메시지 전송 (REST fallback, WebSocket이 우선)
   * @param {string} roomId - 채팅방 ID
   * @param {string} content - 메시지 내용
   * @returns {Promise<ChatMessage>}
   */
  async sendMessage(roomId, content) {
    const mockResponse = () => ({
      messageId: `msg_${Date.now()}`,
      roomId,
      senderId: 'user_12345',
      senderType: 'user',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    })

    return this.post(`/rooms/${roomId}/messages`, { content }, {}, { mockResponse })
  }

  /**
   * 새 채팅방 생성 (의사/AI 챗봇 선택)
   * @param {string} counselorId - 의사 또는 AI 챗봇 ID
   * @param {string} type - 'doctor' | 'ai_bot'
   * @returns {Promise<ChatRoom>}
   */
  async createRoom(counselorId, type = 'doctor') {
    const mockResponse = () => ({
      roomId: `room_${Date.now()}`,
      counselor: {
        id: counselorId,
        name: type === 'ai_bot' ? 'AMA AI 챗봇' : '새 의사',
        type,
        profileImage: 'https://via.placeholder.com/100',
        hospitalName: type === 'ai_bot' ? null : '새 병원',
        specialty: type === 'ai_bot' ? '건강 상담' : '일반의',
        isOnline: true,
      },
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return this.post('/rooms', { counselorId, type }, {}, { mockResponse })
  }

  /**
   * 메시지 읽음 처리
   * @param {string} roomId - 채팅방 ID
   * @param {string} messageId - 메시지 ID
   * @returns {Promise<void>}
   */
  async markAsRead(roomId, messageId) {
    const mockResponse = () => ({ success: true })

    return this.patch(`/rooms/${roomId}/messages/${messageId}/read`, {}, {}, { mockResponse })
  }

  /**
   * 채팅방 나가기
   * @param {string} roomId - 채팅방 ID
   * @returns {Promise<void>}
   */
  async leaveRoom(roomId) {
    const mockResponse = () => ({ success: true })

    return this.delete(`/rooms/${roomId}`, {}, { mockResponse })
  }
}

export const chatApiClient = new ChatApiClient()
export { ChatApiClient }

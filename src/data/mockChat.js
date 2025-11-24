/**
 * Chat Mock 데이터
 * @file mockChat.js
 * @description 채팅 API용 Mock 데이터
 */

// 채팅방 목록 응답
export const MOCK_CHAT_ROOMS_RESPONSE = {
  rooms: [
    {
      roomId: 'room_001',
      counselor: {
        id: 'doctor_001',
        name: '김의사',
        type: 'doctor',
        profileImage: 'https://via.placeholder.com/100',
        hospitalName: '서울대병원',
        specialty: '내과',
        isOnline: true,
      },
      lastMessage: {
        messageId: 'msg_123',
        content: '혈압약은 저녁 식사 후에 복용하시면 됩니다.',
        senderId: 'doctor_001',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: true,
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
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
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: false,
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  totalCount: 2,
}

// 채팅 메시지 응답
export const MOCK_CHAT_MESSAGES_RESPONSE = {
  messages: [
    {
      messageId: 'msg_001',
      senderId: 'user_12345',
      senderType: 'user',
      content: '안녕하세요, 복용 중인 약에 대해 궁금한 게 있어요.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
    {
      messageId: 'msg_002',
      senderId: 'doctor_001',
      senderType: 'counselor',
      content: '네, 말씀하세요. 어떤 부분이 궁금하신가요?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      isRead: true,
    },
    {
      messageId: 'msg_003',
      senderId: 'user_12345',
      senderType: 'user',
      content: '혈압약을 아침에 먹어야 하나요, 저녁에 먹어야 하나요?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23 + 1000 * 60 * 5).toISOString(),
      isRead: true,
    },
    {
      messageId: 'msg_004',
      senderId: 'doctor_001',
      senderType: 'counselor',
      content: '혈압약은 보통 저녁 식사 후에 복용하는 것을 권장합니다. 잠들기 전에 혈압이 높아지는 것을 방지할 수 있기 때문입니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      isRead: true,
    },
    {
      messageId: 'msg_005',
      senderId: 'user_12345',
      senderType: 'user',
      content: '감사합니다! 도움이 많이 되었어요.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22 + 1000 * 60 * 2).toISOString(),
      isRead: true,
    },
  ],
  hasMore: false,
  nextCursor: null,
}

// 채팅 메시지 생성 헬퍼
export const createMockMessage = (roomId, content) => ({
  messageId: `msg_${Date.now()}`,
  roomId,
  senderId: 'user_12345',
  senderType: 'user',
  content,
  timestamp: new Date().toISOString(),
  isRead: false,
})

// 새 채팅방 생성 헬퍼
export const createMockRoom = (counselorId, type = 'doctor') => ({
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

export default {
  MOCK_CHAT_ROOMS_RESPONSE,
  MOCK_CHAT_MESSAGES_RESPONSE,
  createMockMessage,
  createMockRoom,
}

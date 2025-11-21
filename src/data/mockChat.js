export const MOCK_CHAT_ROOMS_RESPONSE = {
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
};

export const MOCK_CHAT_MESSAGES_RESPONSE = {
  messages: [
    {
      messageId: 'msg_001',
      senderId: 'user_12345',
      senderType: 'user', // 'user' | 'pharmacist'
      content: '안녕하세요, 복용 중인 약에 대해 궁금한 게 있어요.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
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
  ],
  hasMore: false,
  nextCursor: null,
};

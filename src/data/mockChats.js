/**
 * 채팅 Mock 데이터
 * @file mockChats.js
 * @description 의사/약사 채팅 및 보호자 메시지용 Mock 데이터
 */

export const MOCK_CHAT_ROOMS = [
  {
    id: 'room-1',
    type: 'DOCTOR',
    title: '의사 상담 - 약물 상호작용',
    participantName: '김의사 (의사)',
    profileImage: '/images/doctor-1.jpg',
    lastMessage: '자몽 주스와 Simvastatin은 함께 복용하면 안 됩니다.',
    lastMessageTime: new Date('2025-11-12T14:30:00Z').toISOString(),
    unreadCount: 2,
    status: 'ACTIVE',
    createdAt: new Date('2025-11-10T10:00:00Z').toISOString(),
  },
  {
    id: 'room-2',
    type: 'PHARMACIST',
    title: '약사 상담 - 약물 효과',
    participantName: '이약사 (약사)',
    profileImage: '/images/pharmacist-1.jpg',
    lastMessage: 'Metformin은 식후 30분 내에 복용하시는 것이 좋습니다.',
    lastMessageTime: new Date('2025-11-11T16:00:00Z').toISOString(),
    unreadCount: 0,
    status: 'ACTIVE',
    createdAt: new Date('2025-11-08T09:00:00Z').toISOString(),
  },
  {
    id: 'room-3',
    type: 'AI_CHATBOT',
    title: 'AI 건강 상담',
    participantName: 'AmaBot (AI 챗봇)',
    profileImage: '/images/ai-bot.png',
    lastMessage: '증상에 대해 더 알려주시면 도움이 될 것 같습니다.',
    lastMessageTime: new Date('2025-11-09T11:00:00Z').toISOString(),
    unreadCount: 0,
    status: 'ACTIVE',
    createdAt: new Date('2025-11-05T13:00:00Z').toISOString(),
  },
]

export const MOCK_CHAT_MESSAGES = {
  'room-1': [
    {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      senderName: '김철수 (나)',
      senderType: 'USER',
      content: '안녕하세요. 자몽 주스를 좋아하는데 약과 함께 먹어도 괜찮을까요?',
      timestamp: new Date('2025-11-10T10:15:00Z').toISOString(),
      readAt: new Date('2025-11-10T10:20:00Z').toISOString(),
    },
    {
      id: 'msg-2',
      roomId: 'room-1',
      senderId: 'doctor-1',
      senderName: '김의사 (의사)',
      senderType: 'DOCTOR',
      content: '안녕하세요. 자몽 주스와 Simvastatin은 함께 복용하면 안 됩니다. 약물 상호작용이 발생할 수 있습니다.',
      timestamp: new Date('2025-11-10T10:30:00Z').toISOString(),
      readAt: new Date('2025-11-10T10:35:00Z').toISOString(),
    },
    {
      id: 'msg-3',
      roomId: 'room-1',
      senderId: 'doctor-1',
      senderName: '김의사 (의사)',
      senderType: 'DOCTOR',
      content: '대신 오렌지 주스나 파인애플은 괜찮습니다.',
      timestamp: new Date('2025-11-10T10:31:00Z').toISOString(),
      readAt: new Date('2025-11-10T10:35:00Z').toISOString(),
    },
    {
      id: 'msg-4',
      roomId: 'room-1',
      senderId: 'user-1',
      senderName: '김철수 (나)',
      senderType: 'USER',
      content: '알겠습니다. 감사합니다!',
      timestamp: new Date('2025-11-10T10:40:00Z').toISOString(),
      readAt: null,
    },
    {
      id: 'msg-5',
      roomId: 'room-1',
      senderId: 'doctor-1',
      senderName: '김의사 (의사)',
      senderType: 'DOCTOR',
      content: '다른 궁금한 점이 있으시면 언제든지 물어보세요.',
      timestamp: new Date('2025-11-12T14:30:00Z').toISOString(),
      readAt: null,
    },
  ],
  'room-2': [
    {
      id: 'msg-6',
      roomId: 'room-2',
      senderId: 'user-1',
      senderName: '김철수 (나)',
      senderType: 'USER',
      content: 'Metformin을 언제 먹으면 좋을까요?',
      timestamp: new Date('2025-11-08T09:15:00Z').toISOString(),
      readAt: new Date('2025-11-08T09:20:00Z').toISOString(),
    },
    {
      id: 'msg-7',
      roomId: 'room-2',
      senderId: 'pharmacist-1',
      senderName: '이약사 (약사)',
      senderType: 'PHARMACIST',
      content: 'Metformin은 식후 30분 내에 복용하시는 것이 좋습니다.',
      timestamp: new Date('2025-11-08T09:30:00Z').toISOString(),
      readAt: new Date('2025-11-08T09:35:00Z').toISOString(),
    },
  ],
}

export const MOCK_CAREGIVER_MESSAGES = [
  {
    id: 'msg-caregiver-1',
    senderId: 'caregiver-1',
    senderName: '딸 (보호자)',
    content: '엄마, 약은 잘 챙겨 드셨어요?',
    timestamp: new Date('2025-11-11T20:00:00Z').toISOString(),
    type: 'TEXT',
  },
  {
    id: 'msg-caregiver-2',
    senderId: 'user-1',
    senderName: '어머니 (시니어)',
    content: '네, 다 챙겨 먹었어.',
    timestamp: new Date('2025-11-11T20:05:00Z').toISOString(),
    type: 'TEXT',
  },
  {
    id: 'msg-caregiver-3',
    senderId: 'caregiver-1',
    senderName: '딸 (보호자)',
    content: '다음주에 병원 가는 거 잊지 마세요!',
    timestamp: new Date('2025-11-11T20:10:00Z').toISOString(),
    type: 'TEXT',
  },
]

export default {
  MOCK_CHAT_ROOMS,
  MOCK_CHAT_MESSAGES,
  MOCK_CAREGIVER_MESSAGES,
}

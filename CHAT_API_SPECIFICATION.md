# Chat API 명세서 (Stage 4)

> AMA...Pill 의사/AI 챗봇 상담 기능 Backend API 정의서
>
> **버전**: 1.0
> **작성일**: 2025-11-10
> **우선순위**: Stage 4 확장 기능 (실시간 상담)

---

## 📋 목차

1. [개요](#-개요)
2. [API 엔드포인트](#-api-엔드포인트)
3. [WebSocket 프로토콜](#-websocket-프로토콜)
4. [Request/Response DTO](#-requestresponse-dto)
5. [Frontend 통합 가이드](#-frontend-통합-가이드)
6. [에러 처리](#-에러-처리)
7. [개발 우선순위](#-개발-우선순위)

---

## 🎯 개요

### 목적
사용자가 의사 또는 AI 챗봇과 1:1 실시간 채팅을 통해 약물 복용, 건강 상담을 받을 수 있는 기능을 제공합니다.

### 핵심 기능
1. **채팅방 목록 조회** - 진행 중인 상담 목록 확인
2. **1:1 실시간 채팅** - 의사/AI 챗봇과 메시지 송수신
3. **메시지 히스토리** - 이전 대화 기록 조회
4. **읽음 상태 관리** - 메시지 읽음/안읽음 표시

### 기술 스택 (Backend)
- **REST API**: 채팅방 목록, 메시지 히스토리 조회
- **WebSocket**: 실시간 메시지 송수신 (Socket.IO 또는 Native WebSocket)
- **AI 챗봇**: OpenAI API / Custom LLM (약물 복용 관련 특화)
- **메시지 저장**: MongoDB or PostgreSQL (채팅 히스토리)

---

## 🔌 API 엔드포인트

### 1. 채팅방 목록 조회

#### **GET** `/api/chat/rooms`

사용자의 채팅방 목록을 조회합니다.

**Request**

```http
GET /api/chat/rooms
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**

| 필드 | 타입 | 필수 | 설명 | 예시 |
|-----|------|-----|------|------|
| `limit` | number | 선택 | 조회할 채팅방 개수 | 20 |
| `offset` | number | 선택 | 페이지네이션 offset | 0 |
| `status` | string | 선택 | 채팅방 상태 필터 | `active`, `archived` |

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "roomId": "room_001",
        "counselor": {
          "id": "doctor_001",
          "name": "김의사",
          "type": "doctor",
          "profileImage": "https://cdn.amapill.com/profiles/doctor_001.jpg",
          "hospitalName": "서울대병원",
          "specialty": "내과",
          "isOnline": true
        },
        "lastMessage": {
          "messageId": "msg_123",
          "content": "혈압약은 저녁 식사 후에 복용하시면 됩니다.",
          "senderId": "doctor_001",
          "senderType": "counselor",
          "timestamp": "2025-11-10T14:30:00Z",
          "isRead": true
        },
        "unreadCount": 0,
        "createdAt": "2025-11-07T10:00:00Z",
        "updatedAt": "2025-11-10T14:30:00Z",
        "status": "active"
      },
      {
        "roomId": "room_002",
        "counselor": {
          "id": "ai_bot_001",
          "name": "AMA AI 챗봇",
          "type": "ai_bot",
          "profileImage": "https://cdn.amapill.com/bot-avatar.jpg",
          "hospitalName": null,
          "specialty": "건강 상담",
          "isOnline": true
        },
        "lastMessage": {
          "messageId": "msg_456",
          "content": "안녕하세요! 약물 복용에 대해 무엇이든 물어보세요.",
          "senderId": "ai_bot_001",
          "senderType": "counselor",
          "timestamp": "2025-11-10T12:00:00Z",
          "isRead": false
        },
        "unreadCount": 2,
        "createdAt": "2025-11-03T09:00:00Z",
        "updatedAt": "2025-11-10T12:00:00Z",
        "status": "active"
      }
    ],
    "totalCount": 2,
    "hasMore": false
  },
  "timestamp": "2025-11-10T15:00:00Z"
}
```

---

### 2. 특정 채팅방의 메시지 히스토리 조회

#### **GET** `/api/chat/rooms/:roomId/messages`

특정 채팅방의 메시지 히스토리를 조회합니다.

**Request**

```http
GET /api/chat/rooms/room_001/messages?limit=50&before=msg_100
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**

| 필드 | 타입 | 필수 | 설명 | 예시 |
|-----|------|-----|------|------|
| `limit` | number | 선택 | 조회할 메시지 개수 (기본값: 50, 최대: 100) | 50 |
| `before` | string | 선택 | 특정 메시지 이전 메시지 조회 (페이지네이션) | `msg_100` |
| `after` | string | 선택 | 특정 메시지 이후 메시지 조회 | `msg_200` |

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "roomId": "room_001",
    "messages": [
      {
        "messageId": "msg_001",
        "roomId": "room_001",
        "senderId": "user_12345",
        "senderType": "user",
        "content": "안녕하세요, 복용 중인 약에 대해 궁금한 게 있어요.",
        "timestamp": "2025-11-09T10:00:00Z",
        "isRead": true,
        "attachments": []
      },
      {
        "messageId": "msg_002",
        "roomId": "room_001",
        "senderId": "doctor_001",
        "senderType": "counselor",
        "content": "네, 말씀하세요. 어떤 부분이 궁금하신가요?",
        "timestamp": "2025-11-09T10:02:00Z",
        "isRead": true,
        "attachments": []
      },
      {
        "messageId": "msg_003",
        "roomId": "room_001",
        "senderId": "user_12345",
        "senderType": "user",
        "content": "혈압약을 아침에 먹어야 하나요, 저녁에 먹어야 하나요?",
        "timestamp": "2025-11-09T10:05:00Z",
        "isRead": true,
        "attachments": []
      },
      {
        "messageId": "msg_004",
        "roomId": "room_001",
        "senderId": "doctor_001",
        "senderType": "counselor",
        "content": "혈압약은 보통 저녁 식사 후에 복용하는 것을 권장합니다. 잠들기 전에 혈압이 높아지는 것을 방지할 수 있기 때문입니다.",
        "timestamp": "2025-11-09T10:10:00Z",
        "isRead": true,
        "attachments": []
      }
    ],
    "hasMore": false,
    "nextCursor": null,
    "prevCursor": "msg_001"
  },
  "timestamp": "2025-11-10T15:00:00Z"
}
```

---

### 3. 새 채팅방 생성

#### **POST** `/api/chat/rooms`

의사 또는 AI 챗봇과의 새 채팅방을 생성합니다.

**Request**

```json
POST /api/chat/rooms
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "counselorId": "doctor_001",
  "type": "doctor"
}
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 | 예시 |
|-----|------|-----|------|------|
| `counselorId` | string | 필수 | 의사 또는 AI 챗봇 ID | `doctor_001`, `ai_bot_001` |
| `type` | string | 필수 | 상담 유형 | `doctor`, `ai_bot` |
| `initialMessage` | string | 선택 | 첫 메시지 (자동 전송) | `안녕하세요, 상담 부탁드립니다.` |

**Response (Success - 201 Created)**

```json
{
  "success": true,
  "data": {
    "roomId": "room_new_001",
    "counselor": {
      "id": "doctor_001",
      "name": "김의사",
      "type": "doctor",
      "profileImage": "https://cdn.amapill.com/profiles/doctor_001.jpg",
      "hospitalName": "서울대병원",
      "specialty": "내과",
      "isOnline": true
    },
    "lastMessage": null,
    "unreadCount": 0,
    "createdAt": "2025-11-10T15:00:00Z",
    "updatedAt": "2025-11-10T15:00:00Z",
    "status": "active"
  },
  "timestamp": "2025-11-10T15:00:00Z"
}
```

---

### 4. 메시지 전송 (REST Fallback)

#### **POST** `/api/chat/rooms/:roomId/messages`

WebSocket이 연결되지 않았을 때 REST API로 메시지를 전송합니다.

**Request**

```json
POST /api/chat/rooms/room_001/messages
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "content": "감사합니다! 도움이 많이 되었어요.",
  "attachments": []
}
```

**Response (Success - 201 Created)**

```json
{
  "success": true,
  "data": {
    "messageId": "msg_new_001",
    "roomId": "room_001",
    "senderId": "user_12345",
    "senderType": "user",
    "content": "감사합니다! 도움이 많이 되었어요.",
    "timestamp": "2025-11-10T15:05:00Z",
    "isRead": false,
    "attachments": []
  },
  "timestamp": "2025-11-10T15:05:00Z"
}
```

---

### 5. 메시지 읽음 처리

#### **PATCH** `/api/chat/rooms/:roomId/messages/:messageId/read`

특정 메시지를 읽음 처리합니다.

**Request**

```http
PATCH /api/chat/rooms/room_001/messages/msg_456/read
Authorization: Bearer {JWT_TOKEN}
```

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "messageId": "msg_456",
    "roomId": "room_001",
    "isRead": true,
    "readAt": "2025-11-10T15:10:00Z"
  },
  "timestamp": "2025-11-10T15:10:00Z"
}
```

---

### 6. 채팅방 나가기

#### **DELETE** `/api/chat/rooms/:roomId`

채팅방에서 나갑니다 (archived 상태로 변경).

**Request**

```http
DELETE /api/chat/rooms/room_001
Authorization: Bearer {JWT_TOKEN}
```

**Response (Success - 200 OK)**

```json
{
  "success": true,
  "data": {
    "roomId": "room_001",
    "status": "archived",
    "archivedAt": "2025-11-10T15:15:00Z"
  },
  "timestamp": "2025-11-10T15:15:00Z"
}
```

---

## 🌐 WebSocket 프로토콜

### 연결

```javascript
// WebSocket 연결 (Socket.IO 예시)
const socket = io('wss://api.amapill.com/chat', {
  auth: {
    token: JWT_TOKEN
  },
  transports: ['websocket']
})

// 연결 성공
socket.on('connect', () => {
  console.log('WebSocket 연결 성공')
})

// 연결 실패
socket.on('connect_error', (error) => {
  console.error('WebSocket 연결 실패:', error)
})
```

### 이벤트

#### 1. 채팅방 입장

**Client → Server**

```json
{
  "event": "join_room",
  "data": {
    "roomId": "room_001"
  }
}
```

**Server → Client (확인)**

```json
{
  "event": "room_joined",
  "data": {
    "roomId": "room_001",
    "joinedAt": "2025-11-10T15:20:00Z"
  }
}
```

#### 2. 메시지 전송

**Client → Server**

```json
{
  "event": "send_message",
  "data": {
    "roomId": "room_001",
    "content": "안녕하세요!",
    "attachments": []
  }
}
```

**Server → Client (에코백)**

```json
{
  "event": "message_sent",
  "data": {
    "messageId": "msg_ws_001",
    "roomId": "room_001",
    "senderId": "user_12345",
    "senderType": "user",
    "content": "안녕하세요!",
    "timestamp": "2025-11-10T15:21:00Z",
    "isRead": false,
    "attachments": []
  }
}
```

#### 3. 새 메시지 수신

**Server → Client**

```json
{
  "event": "new_message",
  "data": {
    "messageId": "msg_ws_002",
    "roomId": "room_001",
    "senderId": "doctor_001",
    "senderType": "counselor",
    "content": "안녕하세요! 무엇을 도와드릴까요?",
    "timestamp": "2025-11-10T15:22:00Z",
    "isRead": false,
    "attachments": []
  }
}
```

#### 4. 타이핑 인디케이터

**Client → Server**

```json
{
  "event": "typing",
  "data": {
    "roomId": "room_001",
    "isTyping": true
  }
}
```

**Server → Client**

```json
{
  "event": "user_typing",
  "data": {
    "roomId": "room_001",
    "userId": "doctor_001",
    "isTyping": true
  }
}
```

#### 5. 메시지 읽음 알림

**Server → Client**

```json
{
  "event": "message_read",
  "data": {
    "roomId": "room_001",
    "messageId": "msg_ws_001",
    "readBy": "doctor_001",
    "readAt": "2025-11-10T15:23:00Z"
  }
}
```

#### 6. 채팅방 나가기

**Client → Server**

```json
{
  "event": "leave_room",
  "data": {
    "roomId": "room_001"
  }
}
```

---

## 📦 Request/Response DTO

### ChatRoom

```typescript
interface ChatRoom {
  roomId: string;
  counselor: Counselor;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: string;  // ISO 8601
  updatedAt: string;
  status: 'active' | 'archived';
}
```

### Counselor

```typescript
interface Counselor {
  id: string;
  name: string;
  type: 'doctor' | 'ai_bot';
  profileImage: string;
  hospitalName: string | null;
  specialty: string;
  isOnline: boolean;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  messageId: string;
  roomId: string;
  senderId: string;
  senderType: 'user' | 'counselor';
  content: string;
  timestamp: string;  // ISO 8601
  isRead: boolean;
  attachments: MessageAttachment[];
}
```

### MessageAttachment

```typescript
interface MessageAttachment {
  attachmentId: string;
  type: 'image' | 'file';
  url: string;
  fileName: string;
  fileSize: number;
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

---

## 🔧 Frontend 통합 가이드

### 1. WebSocket 연결 관리 (Hook)

```javascript
// src/features/chat/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'

export const useWebSocket = (roomId) => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (!roomId || !accessToken) return

    // WebSocket 연결
    socketRef.current = io(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/chat', {
      auth: { token: accessToken },
      transports: ['websocket']
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      // 채팅방 입장
      socketRef.current.emit('join_room', { roomId })
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomId })
        socketRef.current.disconnect()
      }
    }
  }, [roomId, accessToken])

  const sendMessage = (content) => {
    if (!socketRef.current || !isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.')
      return
    }

    socketRef.current.emit('send_message', {
      roomId,
      content,
      attachments: []
    })
  }

  const onNewMessage = (callback) => {
    if (!socketRef.current) return

    socketRef.current.on('new_message', callback)
    socketRef.current.on('message_sent', callback)

    return () => {
      socketRef.current.off('new_message', callback)
      socketRef.current.off('message_sent', callback)
    }
  }

  return {
    isConnected,
    sendMessage,
    onNewMessage,
    socket: socketRef.current
  }
}
```

### 2. 사용 예시

```jsx
// src/features/chat/pages/ChatConversationPage.jsx
import { useWebSocket } from '../hooks/useWebSocket'

const ChatConversationPage = () => {
  const { roomId } = useParams()
  const [messages, setMessages] = useState([])
  const { isConnected, sendMessage, onNewMessage } = useWebSocket(roomId)

  useEffect(() => {
    const cleanup = onNewMessage((newMessage) => {
      setMessages((prev) => [...prev, newMessage])
    })

    return cleanup
  }, [onNewMessage])

  const handleSend = (content) => {
    if (isConnected) {
      sendMessage(content)
    } else {
      // WebSocket 미연결 시 REST API Fallback
      chatApiClient.sendMessage(roomId, content)
        .then((message) => setMessages([...messages, message]))
    }
  }

  return (
    // ... UI
  )
}
```

---

## ⚠️ 에러 처리

### 에러 코드 정의

| 에러 코드 | HTTP Status | 설명 | 해결 방법 |
|----------|-------------|------|----------|
| `ROOM_NOT_FOUND` | 404 | 채팅방을 찾을 수 없음 | 채팅방 목록 재조회 |
| `COUNSELOR_OFFLINE` | 503 | 의사가 오프라인 상태 | AI 챗봇 대안 제시 |
| `MESSAGE_SEND_FAILED` | 500 | 메시지 전송 실패 | 재시도 또는 REST API Fallback |
| `WEBSOCKET_CONNECTION_FAILED` | 503 | WebSocket 연결 실패 | REST API 모드로 전환 |
| `UNAUTHORIZED_ACCESS` | 403 | 권한 없는 채팅방 접근 | 로그인 재확인 |

---

## 🚀 개발 우선순위

### Phase 1 - MVP 필수 기능 (Week 1-2)
1. ✅ **REST API 구현**
   - 채팅방 목록 조회
   - 메시지 히스토리 조회
   - 메시지 전송 (REST Fallback)
2. ✅ **Frontend 깡통 페이지**
   - DoctorChatListPage (목록)
   - ChatConversationPage (대화)
   - Mock 데이터로 UI 동작

### Phase 2 - 실시간 기능 (Week 3-4)
3. **WebSocket 서버 구현**
   - Socket.IO 또는 Native WebSocket
   - 메시지 실시간 송수신
   - 타이핑 인디케이터
4. **Frontend WebSocket 연동**
   - useWebSocket Hook
   - 실시간 메시지 수신
   - 연결 상태 관리

### Phase 3 - AI 챗봇 통합 (Week 5+)
5. **AI 챗봇 구현**
   - OpenAI API 연동
   - 약물 복용 관련 프롬프트 엔지니어링
   - 응답 품질 개선
6. **고급 기능**
   - 이미지 첨부
   - 음성 메시지 (선택)
   - 채팅 검색

---

## 📌 참고사항

### Backend 개발 시 고려사항

1. **WebSocket 서버 선택**
   ```bash
   # Socket.IO (추천 - 자동 재연결, Fallback 지원)
   npm install socket.io

   # Native WebSocket (경량, 직접 구현 필요)
   # Spring Boot WebSocket
   ```

2. **메시지 저장**
   - MongoDB: 빠른 쓰기, 채팅 히스토리에 적합
   - PostgreSQL: 관계형 데이터와 통합 용이

3. **AI 챗봇 응답 시간**
   - 목표: 2초 이내
   - Streaming 응답 고려 (타이핑 효과)
   - 로딩 인디케이터 필수

4. **보안**
   - 메시지 암호화 (TLS/SSL)
   - XSS 방지: 메시지 내용 sanitize
   - Rate Limiting: 스팸 방지

5. **성능**
   - WebSocket 연결 수 제한
   - 메시지 히스토리 페이지네이션
   - Redis 캐싱 (온라인 상태, 읽지 않은 메시지 수)

---

**최종 수정일**: 2025-11-10
**작성자**: AMA...Pill 개발팀
**문의**: [issues.md](./issues.md) 참조

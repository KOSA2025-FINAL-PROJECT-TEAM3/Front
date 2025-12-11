import logger from "@core/utils/logger"
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { chatApiClient } from '@/core/services/api/chatApiClient'
import styles from './ChatConversationPage.module.scss'

/**
 * ChatConversationPage - 1:1 채팅 대화 페이지
 */
export const ChatConversationPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [counselor, setCounselor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMessages()
  }, [roomId, loadMessages])

  useEffect(() => {
    // 새 메시지가 추가되면 스크롤을 맨 아래로
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApiClient.getMessages(roomId)
      setMessages(response.messages || [])

      // 채팅방 정보도 가져오기 (임시로 첫 메시지의 발신자 정보 사용)
      const counselorMessage = response.messages?.find((m) => m.senderType === 'counselor')
      if (counselorMessage) {
        setCounselor({
          id: counselorMessage.senderId,
          name: '김의사', // TODO: 실제 API에서 가져오기
          profileImage: 'https://via.placeholder.com/100',
          type: 'doctor',
        })
      }
    } catch (err) {
      logger.error('메시지 로드 실패:', err)
      setError('메시지를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [roomId, setIsLoading, setError, setMessages, setCounselor])

  const handleSendMessage = async (content) => {
    if (!content.trim() || isSending) return

    setIsSending(true)

    try {
      const newMessage = await chatApiClient.sendMessage(roomId, content)
      setMessages([...messages, newMessage])

      // WebSocket이 연결되면 여기서 실시간으로 전송
      // TODO: WebSocket 연동 후 구현
    } catch (err) {
      logger.error('메시지 전송 실패:', err)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadMessages}>다시 시도</button>
          <button onClick={handleBack}>목록으로</button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showBottomNav={false}>
      <div className={styles.page}>
        {/* 채팅 헤더 */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {counselor && (
            <div className={styles.counselorInfo}>
              <img src={counselor.profileImage} alt={counselor.name} className={styles.avatar} />
              <div className={styles.info}>
                <h2 className={styles.name}>{counselor.name}</h2>
                {counselor.type === 'ai_bot' && (
                  <span className={styles.badge}>AI 챗봇</span>
                )}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {/* TODO: 메뉴 버튼 추가 */}
          </div>
        </header>

        {/* 메시지 리스트 */}
        <div className={styles.messageList}>
          {isLoading && (
            <div className={styles.loading}>
              <p>메시지를 불러오는 중...</p>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className={styles.empty}>
              <p>아직 메시지가 없습니다.</p>
              <p className={styles.hint}>첫 메시지를 보내보세요!</p>
            </div>
          )}

          {!isLoading && messages.map((message) => {
            const isMe = message.senderType === 'user'
            return (
              <ChatMessage
                key={message.messageId}
                message={message}
                isMe={isMe}
                sender={!isMe ? counselor : null}
              />
            )
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <ChatInput onSend={handleSendMessage} disabled={isSending} />

        {/* WebSocket 미연동 알림 */}
        <div className={styles.notice}>
          <p>⚠️ WebSocket 연동 전: 실시간 메시지는 Mock 데이터로 표시됩니다.</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default ChatConversationPage

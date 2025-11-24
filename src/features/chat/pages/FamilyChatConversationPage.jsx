import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { familyChatApiClient } from '@core/services/api/familyChatApiClient'
import styles from './FamilyChatConversationPage.module.scss'
import useFamily from '@features/family/hooks/useFamily'

let Stomp = null
let SockJS = null

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate()
  const { familyGroupId: routeFamilyGroupId } = useParams()
  const { familyGroup } = useFamily() || {}

  // familyId 파싱 로직
  const rawFamilyId = familyGroup?.id ?? routeFamilyGroupId ?? null
  const familyId = (() => {
    if (!rawFamilyId) return null
    if (typeof rawFamilyId === 'number') return rawFamilyId

    const str = String(rawFamilyId)
    const m = str.match(/(\d+)$/)
    if (m) return Number(m[1])

    const n = Number(str)
    return Number.isNaN(n) ? null : n
  })()

  const messagesEndRef = useRef(null)
  const stompRef = useRef(null)

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  /**
   * ✅ 먼저 선언: 가족 채팅방 + 기존 메시지 로드
   * (useEffect에서 dependency로 쓰기 때문에 위에 있어야 함)
   */
  const loadRoomAndMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const roomResp = await familyChatApiClient.getRoomByFamilyGroupId(familyId)
      setRoom(roomResp)

      if (roomResp?.roomId) {
        const msgs = await familyChatApiClient.getMessages(roomResp.roomId)
        setMessages(msgs || [])
      }
    } catch (err) {
      console.error('가족 채팅 로드 실패', err)
      setError('가족 채팅을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [familyId])

  /**
   * 가족 ID가 확정되면 방 정보 + 메시지 로드
   */
  useEffect(() => {
    if (familyId) loadRoomAndMessages()
  }, [familyId, loadRoomAndMessages])

  /**
   * STOMP 연결/해제
   */
  useEffect(() => {
    if (room?.roomId) connectStomp(room.roomId)
    return () => disconnectStomp()
  }, [room?.roomId])

  /**
   * 스크롤을 항상 맨 아래로 내리기
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * STOMP WebSocket 연결
   */
  const connectStomp = async (roomId) => {
    try {
      if (!Stomp) {
        const stompModule = await import('@stomp/stompjs')
        const sockModule = await import('sockjs-client')
        Stomp = stompModule.Stomp || stompModule
        SockJS = sockModule.default || sockModule
      }

      const wsUrl =
        import.meta.env.VITE_CHAT_WS_URL ||
        (window.location.origin.replace(/^http/, 'ws') + '/ws')

      const socket = new SockJS(wsUrl)
      const client = Stomp.over(socket)
      client.debug = () => {}

      client.connect(
        {},
        () => {
          client.subscribe(`/topic/family/${roomId}`, (msg) => {
            try {
              const body = JSON.parse(msg.body)
              setMessages((prev) => [...prev, body])
            } catch (e) {
              console.error('STOMP 메시지 파싱 실패', e)
            }
          })
        },
        (err) => console.error('STOMP 연결 실패', err),
      )

      stompRef.current = client
    } catch (err) {
      console.warn('STOMP 로드 실패, 실시간 연결 없이 동작합니다.', err)
    }
  }

  /**
   * STOMP 연결 해제
   */
  const disconnectStomp = () => {
    try {
      stompRef.current?.disconnect()
      stompRef.current = null
    } catch {
      // ignore
    }
  }

  /**
   * 메시지 전송
   */
  const handleSendMessage = async (content) => {
    if (!room?.roomId || !content.trim() || isSending) return

    setIsSending(true)
    try {
      const payload = {
        roomId: room.roomId,
        senderId: 'client',
        content,
      }
      const resp = await familyChatApiClient.postMessage(room.roomId, payload)
      setMessages((prev) => [...prev, resp])
    } catch (err) {
      console.error('메시지 전송 실패', err)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleBack = () => navigate(-1)

  /**
   * 에러 화면
   */
  if (error) {
    return (
      <MainLayout>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadRoomAndMessages}>다시 시도</button>
          <button onClick={handleBack}>뒤로</button>
        </div>
      </MainLayout>
    )
  }

  /**
   * 기본 화면
   */
  return (
    <MainLayout showBottomNav={false}>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            뒤로
          </button>
          <h2 className={styles.title}>가족 채팅</h2>
        </header>

        <div className={styles.messageList}>
          {isLoading && (
            <div className={styles.loading}>
              <p>로딩중...</p>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className={styles.empty}>
              <p>아직 메시지가 없습니다.</p>
            </div>
          )}

          {!isLoading &&
            messages.map((m) => (
              <ChatMessage
                key={m.messageId || m.timestamp || Math.random()}
                message={m}
                isMe={m.senderType === 'user' || m.senderId === 'client'}
              />
            ))}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isSending} />
      </div>
    </MainLayout>
  )
}

export default FamilyChatConversationPage

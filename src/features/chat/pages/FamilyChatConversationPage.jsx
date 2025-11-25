import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { familyChatApiClient } from '@core/services/api/familyChatApiClient'
import styles from './FamilyChatConversationPage.module.scss'

let Stomp = null
let SockJS = null

export const FamilyChatConversationPage = () => {
  const navigate = useNavigate()
  const { familyGroupId: routeFamilyGroupId } = useParams()

  // familyId 직접 route에서만 사용
  const rawFamilyId = routeFamilyGroupId ?? null
  const familyId = (() => {
    if (!rawFamilyId) return null
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

  const loadRoomAndMessages = useCallback(async () => {
    if (!familyId) return
    setIsLoading(true)
    setError(null)

    try {
      let roomResp = null
      try {
        roomResp = await familyChatApiClient.getRoomByFamilyGroupId(familyId)
      } catch (err) {
        if (err?.response?.status === 404) {
          roomResp = await familyChatApiClient.createOrUpdateRoom({
            familyGroupId: familyId,
            roomName: 'Family Chat',
          })
        } else {
          throw err
        }
      }

      setRoom(roomResp)

      if (roomResp?.roomId) {
        const msgs = await familyChatApiClient.getMessages(roomResp.roomId)
        setMessages(msgs || [])
      }
    } catch (err) {
      console.error('가족채팅 로드 실패', err)
      setError('가족채팅을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    if (familyId) loadRoomAndMessages()
  }, [familyId, loadRoomAndMessages])

  useEffect(() => {
    if (room?.roomId) connectStomp(room.roomId)
    return () => disconnectStomp()
  }, [room?.roomId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
              console.error('STOMP message parse failed', e)
            }
          })
        },
        (err) => console.error('STOMP connect failed', err),
      )

      stompRef.current = client
    } catch (err) {
      console.warn('STOMP load failed; will retry connect', err)
    }
  }

  const disconnectStomp = () => {
    try {
      stompRef.current?.disconnect()
      stompRef.current = null
    } catch {
      // ignore
    }
  }

  const handleSendMessage = async (content) => {
    if (!room?.roomId || !content.trim() || isSending) return

    setIsSending(true)
    try {
      if (!stompRef.current) {
        throw new Error('연결되지 않았습니다.')
      }
      const payload = {
        roomId: room.roomId,
        familyMemberId: 1, // 기본값
        memberNickname: 'me',
        content,
      }
      stompRef.current.send(`/app/family/${room.roomId}`, {}, JSON.stringify(payload))

      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          senderId: 1,
          senderType: 'user',
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error('메시지 전송 실패', err)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleBack = () => navigate(-1)

  if (error) {
    return (
      <MainLayout>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadRoomAndMessages}>{'다시 시도'}</button>
          <button onClick={handleBack}>{'뒤로'}</button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showBottomNav={false}>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            {'뒤로'}
          </button>
          <h2 className={styles.title}>{'가족채팅'}</h2>
        </header>

        <div className={styles.messageList}>
          {isLoading && (
            <div className={styles.loading}>
              <p>{'로딩중..'}</p>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className={styles.empty}>
              <p>{'아직 메시지가 없습니다.'}</p>
            </div>
          )}

          {!isLoading &&
            messages.map((m) => (
              <ChatMessage
                key={m.messageId || m.timestamp || Math.random()}
                message={m}
                isMe={m.senderType === 'user'}
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

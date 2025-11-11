import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { chatApiClient } from '@core/services/api/chatApiClient'
import styles from './ChatConversationPage.module.scss'

/**
 * ChatConversationPage - 1:1 梨꾪똿 ????섏씠吏
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
  }, [roomId])

  useEffect(() => {
    // ??硫붿떆吏媛 異붽??섎㈃ ?ㅽ겕濡ㅼ쓣 留??꾨옒濡?    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApiClient.getMessages(roomId)
      setMessages(response.messages || [])

      // 梨꾪똿諛??뺣낫??媛?몄삤湲?(?꾩떆濡?泥?硫붿떆吏??諛쒖떊???뺣낫 ?ъ슜)
      const counselorMessage = response.messages?.find((m) => m.senderType === 'counselor')
      if (counselorMessage) {
        setCounselor({
          id: counselorMessage.senderId,
          name: '源?섏궗', // TODO: ?ㅼ젣 API?먯꽌 媛?몄삤湲?          profileImage: 'https://via.placeholder.com/100',
          type: 'doctor',
        })
      }
    } catch (err) {
      console.error('硫붿떆吏 濡쒕뱶 ?ㅽ뙣:', err)
      setError('硫붿떆吏瑜?遺덈윭?ㅻ뒗???ㅽ뙣?덉뒿?덈떎.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content) => {
    if (!content.trim() || isSending) return

    setIsSending(true)

    try {
      const newMessage = await chatApiClient.sendMessage(roomId, content)
      setMessages([...messages, newMessage])

      // WebSocket???곌껐?섎㈃ ?ш린???ㅼ떆媛꾩쑝濡??꾩넚
      // TODO: WebSocket ?곕룞 ??援ы쁽
    } catch (err) {
      console.error('硫붿떆吏 ?꾩넚 ?ㅽ뙣:', err)
      alert('硫붿떆吏 ?꾩넚???ㅽ뙣?덉뒿?덈떎.')
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
          <button onClick={loadMessages}>?ㅼ떆 ?쒕룄</button>
          <button onClick={handleBack}>紐⑸줉?쇰줈</button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showBottomNav={false}>
      <div className={styles.page}>
        {/* 梨꾪똿 ?ㅻ뜑 */}
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
                  <span className={styles.badge}>AI 梨쀫큸</span>
                )}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {/* TODO: 硫붾돱 踰꾪듉 異붽? */}
          </div>
        </header>

        {/* 硫붿떆吏 由ъ뒪??*/}
        <div className={styles.messageList}>
          {isLoading && (
            <div className={styles.loading}>
              <p>硫붿떆吏瑜?遺덈윭?ㅻ뒗 以?..</p>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className={styles.empty}>
              <p>?꾩쭅 硫붿떆吏媛 ?놁뒿?덈떎.</p>
              <p className={styles.hint}>泥?硫붿떆吏瑜?蹂대궡蹂댁꽭??</p>
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

        {/* ?낅젰李?*/}
        <ChatInput onSend={handleSendMessage} disabled={isSending} />

        {/* WebSocket 誘몄뿰???뚮┝ */}
        <div className={styles.notice}>
          <p>?좑툘 WebSocket ?곕룞 ?? ?ㅼ떆媛?硫붿떆吏??Mock ?곗씠?곕줈 ?쒖떆?⑸땲??</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default ChatConversationPage

import { useMemo } from 'react'
import styles from './ChatMessage.module.scss'

/**
 * ChatMessage - 채팅 메시지 말풍선 컴포넌트
 * @param {Object} message - 메시지 데이터
 * @param {boolean} isMe - 내가 보낸 메시지인지 여부
 * @param {Object} sender - 발신자 정보 (의사/AI 챗봇 정보)
 */
export const ChatMessage = ({ message, isMe, sender }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const messageClass = useMemo(() => {
    return `${styles.message} ${isMe ? styles.mine : styles.theirs}`
  }, [isMe])

  return (
    <div className={messageClass}>
      {!isMe && sender && (
        <div className={styles.avatar}>
          <img src={sender.profileImage} alt={sender.name} />
        </div>
      )}

      <div className={styles.content}>
        {!isMe && sender && (
          <span className={styles.senderName}>{sender.name}</span>
        )}
        <div className={styles.bubble}>
          <p className={styles.text}>{message.content}</p>
        </div>
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.timestamp)}</span>
          {isMe && message.isRead && (
            <span className={styles.readStatus}>읽음</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './ChatRoomCard.module.scss'

/**
 * ChatRoomCard - 채팅방 목록에서 사용되는 카드 컴포넌트
 * @param {Object} room - 채팅방 데이터
 */
export const ChatRoomCard = ({ room }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(ROUTE_PATHS.chatConversation.replace(':roomId', room.roomId))
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // 1분 미만
    if (diff < 60 * 1000) {
      return '방금 전'
    }

    // 1시간 미만
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}분 전`
    }

    // 24시간 미만
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`
    }

    // 7일 미만
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}일 전`
    }

    // 그 이상
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const counselor = room.counselor
  const isAiBot = counselor.type === 'ai_bot'

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.avatar}>
        <img src={counselor.profileImage} alt={counselor.name} />
        {counselor.isOnline && <span className={styles.onlineBadge} />}
        {isAiBot && <span className={styles.botBadge}>AI</span>}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.info}>
            <h3 className={styles.name}>{counselor.name}</h3>
            <span className={styles.hospital}>
              {counselor.hospitalName || counselor.specialty}
            </span>
          </div>
          {room.lastMessage && (
            <span className={styles.timestamp}>{formatTimestamp(room.lastMessage.timestamp)}</span>
          )}
        </div>

        {room.lastMessage && (
          <p className={styles.lastMessage}>
            {room.lastMessage.content}
          </p>
        )}
      </div>

      {room.unreadCount > 0 && (
        <div className={styles.unreadBadge}>
          {room.unreadCount > 99 ? '99+' : room.unreadCount}
        </div>
      )}
    </div>
  )
}

export default ChatRoomCard

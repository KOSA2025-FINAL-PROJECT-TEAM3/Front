import { useMemo } from 'react'
import styles from './ChatMessage.module.scss'
import ReactMarkdown from 'react-markdown' // react-markdown 라이브러리 추가

/**
 * ChatMessage - 채팅 메시지 말풍선 컴포넌트
 */
export const ChatMessage = ({ message, isMe, sender }) => {
  
  // ✅ 날짜 포맷팅 함수 (배열과 문자열 모두 처리하도록 수정됨)
  const formatTime = (dateData) => {
    if (!dateData) return '';

    let date;
    
    // 1. 백엔드가 배열로 줄 때: [2025, 11, 25, 18, 30]
    if (Array.isArray(dateData)) {
      const [year, month, day, hour, minute] = dateData;
      // month는 0부터 시작하므로 -1 필수
      date = new Date(year, month - 1, day, hour, minute);
    } 
    // 2. 문자열로 줄 때: "2025-11-25T18:30:00"
    else {
      date = new Date(dateData);
    }

    // 시간 변환 (오전/오후 HH:MM)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  }

  // ✅ 메시지 내 시간 필드 찾기 (createdAt 또는 timestamp 둘 다 지원)
  const timeDisplay = formatTime(message.createdAt || message.timestamp);

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
        {!isMe && (
          // sender가 없으면 message.memberNickname 사용 (안전장치 추가)
          <span className={styles.senderName}>
            {sender ? sender.name : (message.familyMemberId === 0 ? 'AI 봇' : (message.memberNickname || '알 수 없음'))}
          </span>
        )}
        
        <div className={styles.bubble}>
          {message.type === "IMAGE" ? (
            <img src={message.content} alt="채팅 이미지" className={styles.chatImage} />
          ) : message.type === "AI_LOADING" ? ( // [GEMINI-FIX] AI 로딩 메시지 타입 처리
            <p className={`${styles.text} ${styles.aiLoadingText}`}>
              <span className={styles.loadingDot}></span>
              <span className={styles.loadingDot}></span>
              <span className={styles.loadingDot}></span>
              {message.content}
            </p>
          ) : (
            // [GEMINI-FIX]: 그 외의 경우 텍스트 메시지를 렌더링
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className={styles.text} {...props} />,
                // 필요하다면 다른 HTML 요소(h1, h2, ul, li 등)에도 스타일을 적용할 수 있습니다.
                // h1: ({ node, ...props }) => <h1 className={styles.markdownH1} {...props} />,
                // ul: ({ node, ...props }) => <ul className={styles.markdownUl} {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        <div className={styles.meta}>
          {/* 안 읽은 사람 수 (노란 숫자) */}
          {message.unreadCount > 0 && (
            <span className={styles.unreadCount}>{message.unreadCount}</span>
          )}
          
          {/* ✅ 수정된 시간 표시 */}
          <span className={styles.time}>{timeDisplay}</span>
          
          {isMe && message.isRead && (
            <span className={styles.readStatus}>읽음</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
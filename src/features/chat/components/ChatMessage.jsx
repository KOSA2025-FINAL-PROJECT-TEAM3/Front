import { useMemo, memo } from 'react'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import ReactMarkdown from 'react-markdown' // react-markdown 라이브러리 추가

/**
 * ChatMessage - 채팅 메시지 말풍선 컴포넌트
 */
export const ChatMessage = memo(({ message, isMe, sender }) => {

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

  const layoutDirection = useMemo(() => (isMe ? 'row-reverse' : 'row'), [isMe])
  const metaDirection = useMemo(() => (isMe ? 'row-reverse' : 'row'), [isMe])
  const bubbleSx = useMemo(() => {
    if (isMe) {
      return {
        bgcolor: '#2EC4B6',
        color: 'common.white',
        borderRadius: 2.5,
        borderTopRightRadius: 1,
      }
    }
    return {
      bgcolor: 'common.white',
      color: '#0F172A',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2.5,
      borderTopLeftRadius: 1,
    }
  }, [isMe])

  return (
    <Stack direction={layoutDirection} spacing={1} alignItems="flex-end" sx={{ mb: 2 }}>
      {sender?.profileImage ? (
        <Box
          component="img"
          src={sender.profileImage}
          alt={sender.name}
          sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : !isMe ? (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: 14,
            bgcolor: 'common.white',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {message.familyMemberId === 0 ? '🤖' : '👴'}
        </Avatar>
      ) : null}

      <Box sx={{ maxWidth: { xs: '80%', md: '70%' }, display: 'flex', flexDirection: 'column' }}>
        {!isMe ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, ml: 0.5 }}>
            {message.familyMemberId === 0 ? 'AI 약사' : (sender?.name || message.memberNickname || '알 수 없음')}
          </Typography>
        ) : null}

        <Box
          sx={{
            px: 2,
            py: 1,
            fontSize: 15,
            lineHeight: 1.5,
            wordBreak: 'break-word',
            ...bubbleSx,
          }}
        >
          {message.type === "IMAGE" ? (
            <Box
              component="img"
              src={message.content}
              alt="채팅 이미지"
              sx={{ display: 'block', maxWidth: '100%', borderRadius: 2, mt: 0.5 }}
            />
          ) : message.type === "AI_LOADING" ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={14} thickness={6} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ m: 0, color: 'text.secondary', fontStyle: 'italic' }}>
                {message.content}
              </Typography>
            </Stack>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <Typography variant="body2" sx={{ m: 0, whiteSpace: 'pre-wrap', color: 'inherit' }} {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </Box>

        <Stack direction={metaDirection} spacing={0.75} alignItems="flex-end" sx={{ mt: 0.5, mx: 0.5 }}>
          {message.unreadCount > 0 ? (
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 900, color: '#0F766E' }}>
              {message.unreadCount}
            </Typography>
          ) : null}

          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
            {timeDisplay}
          </Typography>

          {isMe && message.isRead ? (
            <Typography variant="caption" sx={{ fontSize: 11, color: 'success.main' }}>
              읽음
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  )
})

export default ChatMessage

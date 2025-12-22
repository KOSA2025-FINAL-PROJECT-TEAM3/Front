import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material'

/**
 * ChatRoomCard - 채팅방 목록에서 사용되는 카드 컴포넌트
 * @param {Object} room - 채팅방 데이터
 */
export const ChatRoomCard = ({ room }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    const roomId = room?.roomId
    if (!roomId) {
      navigate(ROUTE_PATHS.familyChat)
      return
    }
    navigate(ROUTE_PATHS.familyChatByGroup.replace(':familyGroupId', String(roomId)))
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

  const counselor = room?.counselor || {}
  const isAiBot = counselor.type === 'ai_bot'

  return (
    <Paper
      variant="outlined"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2,
        cursor: 'pointer',
        borderRadius: 2,
        '&:hover': { bgcolor: 'grey.50' },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          src={counselor.profileImage}
          alt={counselor.name || '상담사'}
          sx={{ width: 48, height: 48 }}
        />
        {counselor.isOnline ? (
          <Box
            sx={{
              position: 'absolute',
              right: 1,
              bottom: 1,
              width: 12,
              height: 12,
              bgcolor: 'success.main',
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'common.white',
            }}
          />
        ) : null}
        {isAiBot ? (
          <Chip
            label="AI"
            size="small"
            color="secondary"
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              height: 18,
              '& .MuiChip-label': { px: 0.75, fontSize: 10, fontWeight: 800 },
            }}
          />
        ) : null}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
              {counselor.name || '상담'}
            </Typography>
            {counselor.hospitalName || counselor.specialty ? (
              <Typography variant="body2" color="text.secondary" noWrap>
                {counselor.hospitalName || counselor.specialty}
              </Typography>
            ) : null}
          </Stack>
          {room?.lastMessage?.timestamp ? (
            <Typography variant="caption" color="text.disabled" noWrap>
              {formatTimestamp(room.lastMessage.timestamp)}
            </Typography>
          ) : null}
        </Stack>

        {room?.lastMessage?.content ? (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {room.lastMessage.content}
          </Typography>
        ) : null}
      </Box>

      {room?.unreadCount > 0 ? (
        <Box
          sx={{
            flexShrink: 0,
            alignSelf: 'center',
            minWidth: 20,
            height: 20,
            px: 0.75,
            bgcolor: 'error.main',
            color: 'common.white',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {room.unreadCount > 99 ? '99+' : room.unreadCount}
        </Box>
      ) : null}
    </Paper>
  )
}

export default ChatRoomCard

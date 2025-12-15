import logger from "@core/utils/logger"
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { Alert, Avatar, Box, Button, CircularProgress, IconButton, Paper, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { chatApiClient } from '@/core/services/api/chatApiClient'
import { toast } from '@shared/components/toast/toastStore'

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
          name: counselorMessage.senderName || '상담사',
          profileImage: counselorMessage.senderProfileImage,
          type: 'doctor',
        })
      }
    } catch (err) {
      logger.error('메시지 로드 실패:', err)
      setError('메시지를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

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
      toast.error('메시지 전송에 실패했습니다.')
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
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Stack direction="row" spacing={1}>
                <Button color="inherit" size="small" onClick={loadMessages}>
                  다시 시도
                </Button>
                <Button color="inherit" size="small" onClick={handleBack}>
                  목록으로
                </Button>
              </Stack>
            }
          >
            {error}
          </Alert>
        </Box>
      </MainLayout>
    )
  }

  return (
    <MainLayout showBottomNav={false}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.100' }}>
        {/* 채팅 헤더 */}
        <Paper square variant="outlined" sx={{ borderLeft: 0, borderRight: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
            <IconButton onClick={handleBack} aria-label="뒤로">
              <ArrowBackIcon />
            </IconButton>

            {counselor ? (
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                <Avatar src={counselor.profileImage} alt={counselor.name} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }} noWrap>
                    {counselor.name}
                  </Typography>
                  {counselor.type === 'ai_bot' ? (
                    <Typography variant="caption" color="secondary">
                      AI 챗봇
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            ) : (
              <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
                채팅
              </Typography>
            )}

            <Box />
          </Stack>
        </Paper>

        {/* 메시지 리스트 */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
          {isLoading && (
            <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                메시지를 불러오는 중...
              </Typography>
            </Stack>
          )}

          {!isLoading && messages.length === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                아직 메시지가 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                첫 메시지를 보내보세요!
              </Typography>
            </Paper>
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
        </Box>

        {/* 입력창 */}
        <ChatInput onSend={handleSendMessage} disabled={isSending} allowImageUpload={false} />


      </Box>
    </MainLayout>
  )
}

export default ChatConversationPage

import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper, Stack, Typography, Tooltip } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'

/**
 * ChatInput - 채팅 메시지 입력 컴포넌트
 * @param {Function} onSend - 메시지 전송 핸들러 (text, file)
 * @param {boolean} disabled - 입력 비활성화 여부
 * @param {boolean} allowImageUpload - 이미지 업로드 허용 여부
 * @param {string[]} quickChips - 빠른 전송 칩(선택)
 */
export const ChatInput = ({ onSend, disabled = false, allowImageUpload = true, quickChips = [] }) => {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isAiMode, setIsAiMode] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    let trimmed = message.trim()
    if ((!trimmed && !selectedFile) || disabled) return

    // AI 모드이고 이미 /ai로 시작하지 않는 경우 접두사 추가
    if (isAiMode && trimmed && !trimmed.startsWith('/ai')) {
      trimmed = `/ai ${trimmed}`
    }

    // 텍스트와 파일을 함께 부모에게 전달
    onSend(trimmed, allowImageUpload ? selectedFile : null)

    setMessage('')
    setSelectedFile(null)
    // 전송 후 AI 모드 자동 해제
    if (isAiMode) {
      setIsAiMode(false)
    }

    // 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    // Enter만 누르면 전송 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      if (textareaRef.current) textareaRef.current.focus()
    }
    // 같은 파일 다시 선택 가능하게 초기화
    e.target.value = ''
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const toggleAiMode = () => {
    setIsAiMode((prev) => !prev)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // AI 모드일 때 보여줄 기본 추천 질문들
  const aiDefaultChips = ['오늘 약 다 드셨어?', '지금 먹을 약 뭐야?', '무슨 약 드시고 계셔?', '이 약이랑 같이 먹어도 돼?']

  useEffect(() => {
    // 컴포넌트 마운트 시 포커스
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [disabled])

  return (
    <Paper
      variant="outlined"
      sx={{
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
        borderRadius: 0,
        bgcolor: 'common.white',
        pb: 'calc(var(--safe-area-bottom) + 12px)',
      }}
    >
      {/* Quick chips - AI 모드일 때만 '샥-' 하고 나타남 */}
      {isAiMode ? (
        <Box sx={{ px: 2, pt: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              WebkitOverflowScrolling: 'touch',
              // 애니메이션 효과 추가
              animation: 'fadeInSlide 0.3s ease-out',
              '@keyframes fadeInSlide': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {aiDefaultChips.map((chip) => (
              <Box
                key={chip}
                component="button"
                type="button"
                disabled={disabled}
                onClick={() => {
                  // 바로 전송하지 않고 입력창에 채워줌
                  setMessage(`${chip} `)
                  // 입력창에 포커스 주어 바로 약 이름을 적을 수 있게 함
                  if (textareaRef.current) {
                    textareaRef.current.focus()
                    // 높이 조절
                    setTimeout(() => {
                      textareaRef.current.style.height = 'auto'
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                    }, 0)
                  }
                }}
                style={{
                  whiteSpace: 'nowrap',
                  border: '1px solid #7C8CFF',
                  background: '#F0F4FF',
                  color: '#6366F1',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {chip}
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {/* 파일 미리보기 (입력창 위에 표시) */}
      {allowImageUpload && selectedFile ? (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <AttachFileIcon fontSize="small" />
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, minWidth: 0 }}>
                  {selectedFile.name}
                </Typography>
              </Stack>
              <IconButton size="small" onClick={handleRemoveFile} aria-label="첨부 파일 제거">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      ) : null}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5 }}
      >
        {allowImageUpload ? (
          <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={isAiMode ? '일반 모드로 전환' : 'AI 모드로 전환'}>
            <IconButton
              type="button"
              disabled={disabled}
              onClick={toggleAiMode}
              aria-label="AI 모드 토글"
              sx={{
                bgcolor: isAiMode ? '#7C8CFF' : '#F8FAFC',
                color: isAiMode ? 'common.white' : '#7C8CFF',
                border: '1px solid',
                borderColor: isAiMode ? '#7C8CFF' : '#E2E8F0',
                '&:hover': {
                  bgcolor: isAiMode ? '#6366F1' : '#EEF2FF',
                },
                transition: 'all 0.2s',
              }}
            >
              <SmartToyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            flex: 1,
            bgcolor: isAiMode ? '#F0F4FF' : '#F8FAFC',
            border: '2px solid',
            borderColor: isAiMode ? '#7C8CFF' : '#E2E8F0',
            borderRadius: 999,
            px: 2,
            py: 1,
            maxHeight: 140,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center', // flex-end에서 center로 변경하여 텍스트가 위/중간부터 채워지게 함
            gap: 1,
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: isAiMode ? '#7C8CFF' : '#2EC4B6',
              boxShadow: isAiMode ? '0 0 0 3px rgba(124,140,255,0.12)' : '0 0 0 3px rgba(46,196,182,0.12)',
            },
          }}
        >
          <Box
            ref={textareaRef}
            component="textarea"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder={
              isAiMode
                ? 'AI 약사에게 무엇이든 물어보세요...'
                : allowImageUpload && selectedFile
                  ? '사진에 대해 질문하세요...'
                  : '메시지를 입력하세요...'
            }
            sx={{
              width: '100%',
              border: 0,
              outline: 0,
              resize: 'none',
              bgcolor: 'transparent',
              fontFamily: 'inherit',
              fontSize: 15,
              lineHeight: 1.5,
              color: 'text.primary',
              maxHeight: 110,
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              '&::placeholder': { color: 'text.disabled', lineHeight: '1.5' },
              '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
            }}
          />

          {allowImageUpload ? (
            <IconButton
              type="button"
              onClick={handleUploadClick}
              disabled={disabled}
              aria-label="이미지 업로드"
              sx={{ color: selectedFile ? (isAiMode ? '#7C8CFF' : '#2EC4B6') : 'text.disabled' }}
            >
              <ImageOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>

        <IconButton
          type="submit"
          color="primary"
          disabled={disabled || (!message.trim() && !selectedFile)}
          sx={{
            bgcolor: message.trim() || selectedFile ? (isAiMode ? '#7C8CFF' : '#2EC4B6') : '#F1F5F9',
            color: message.trim() || selectedFile ? 'common.white' : '#CBD5E1',
            '&:hover': {
              bgcolor: message.trim() || selectedFile ? (isAiMode ? '#6366F1' : '#25A094') : '#F1F5F9',
            },
          }}
          aria-label="전송"
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default ChatInput

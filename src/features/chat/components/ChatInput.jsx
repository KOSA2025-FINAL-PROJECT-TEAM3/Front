import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import MicIcon from '@mui/icons-material/Mic'

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
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmed = message.trim()
    if ((!trimmed && !selectedFile) || disabled) return

    // 텍스트와 파일을 함께 부모에게 전달
    onSend(trimmed, allowImageUpload ? selectedFile : null)

    setMessage('')
    setSelectedFile(null)

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
      {/* Quick chips */}
      {Array.isArray(quickChips) && quickChips.length > 0 ? (
        <Box sx={{ px: 2, pt: 1.25 }}>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch' }}>
            {quickChips.map((chip) => (
              <Box
                key={chip}
                component="button"
                type="button"
                disabled={disabled}
                onClick={() => onSend?.(chip, null)}
                style={{
                  whiteSpace: 'nowrap',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#64748B',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: disabled ? 'not-allowed' : 'pointer',
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
        sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, px: 2, py: 1.5 }}
      >
        {allowImageUpload ? (
          <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
        ) : null}

        <IconButton
          type="button"
          disabled
          aria-label="음성 입력(준비 중)"
          sx={{
            mb: 0.25,
            bgcolor: '#EEF2FF',
            color: '#7C8CFF',
            '&:hover': { bgcolor: '#E0E7FF' },
          }}
        >
          <MicIcon />
        </IconButton>

        <Box
          sx={{
            flex: 1,
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: '#E2E8F0',
            borderRadius: 999,
            px: 2,
            py: 1,
            maxHeight: 140,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            '&:focus-within': { borderColor: '#2EC4B6', boxShadow: '0 0 0 3px rgba(46,196,182,0.12)' },
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
              allowImageUpload && selectedFile
                ? '사진에 대해 질문하세요... (예: /ai 이 약 뭐야?)'
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
              '&::placeholder': { color: 'text.disabled' },
              '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
            }}
          />

          {allowImageUpload ? (
            <IconButton
              type="button"
              onClick={handleUploadClick}
              disabled={disabled}
              aria-label="이미지 업로드"
              sx={{ mb: 0.25, color: selectedFile ? '#2EC4B6' : 'text.disabled' }}
            >
              <ImageOutlinedIcon />
            </IconButton>
          ) : null}
        </Box>

        <IconButton
          type="submit"
          color="primary"
          disabled={disabled || (!message.trim() && !selectedFile)}
          sx={{
            bgcolor: message.trim() || selectedFile ? '#2EC4B6' : '#F1F5F9',
            color: message.trim() || selectedFile ? 'common.white' : '#CBD5E1',
            '&:hover': { bgcolor: message.trim() || selectedFile ? '#25A094' : '#F1F5F9' },
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

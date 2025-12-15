import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'

/**
 * ChatInput - 채팅 메시지 입력 컴포넌트
 * @param {Function} onSend - 메시지 전송 핸들러 (text, file)
 * @param {boolean} disabled - 입력 비활성화 여부
 * @param {boolean} allowImageUpload - 이미지 업로드 허용 여부
 */
export const ChatInput = ({ onSend, disabled = false, allowImageUpload = true }) => {
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
    <Paper variant="outlined" sx={{ borderLeft: 0, borderRight: 0, borderBottom: 0, borderRadius: 0 }}>
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

        {allowImageUpload ? (
          <IconButton
            type="button"
            onClick={handleUploadClick}
            disabled={disabled}
            aria-label="이미지 업로드"
            sx={{ mb: 0.25 }}
          >
            <ImageOutlinedIcon color={selectedFile ? 'primary' : 'inherit'} />
          </IconButton>
        ) : null}

        <Box
          sx={{
            flex: 1,
            bgcolor: 'grey.100',
            borderRadius: 4,
            px: 2,
            py: 1,
            maxHeight: 140,
            overflow: 'hidden',
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
        </Box>

        <IconButton
          type="submit"
          color="primary"
          disabled={disabled || (!message.trim() && !selectedFile)}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
          aria-label="전송"
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default ChatInput

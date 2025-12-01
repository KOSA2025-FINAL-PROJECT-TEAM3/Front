import { useState, useRef, useEffect } from 'react'
import styles from './ChatInput.module.scss'

/**
 * ChatInput - 채팅 메시지 입력 컴포넌트
 * @param {Function} onSend - 메시지 전송 핸들러 (text, file)
 * @param {boolean} disabled - 입력 비활성화 여부
 */
export const ChatInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmed = message.trim()
    if ((!trimmed && !selectedFile) || disabled) return

    // 텍스트와 파일을 함께 부모에게 전달
    onSend(trimmed, selectedFile)

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
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (textareaRef.current) textareaRef.current.focus();
    }
    // 같은 파일 다시 선택 가능하게 초기화
    e.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 포커스
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [disabled])

  return (
    <div className={styles.container}>
      {/* 파일 미리보기 (입력창 위에 표시) */}
      {selectedFile && (
        <div className={styles.filePreview}>
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>📎</span>
            <span className={styles.fileName}>{selectedFile.name}</span>
          </div>
          <button type="button" onClick={handleRemoveFile} className={styles.removeButton}>
            ✕
          </button>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 이미지 업로드 버튼 */}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={disabled}
          className={styles.uploadButton}
          style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          aria-label="이미지 업로드"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill={selectedFile ? "#4A90E2" : "#888"}/>
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
        />

        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={selectedFile ? "사진에 대해 질문하세요... (예: /ai 이 약 뭐야?)" : "메시지를 입력하세요..."}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
        </div>

        <button
          type="submit"
          className={styles.sendButton}
          disabled={disabled || (!message.trim() && !selectedFile)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default ChatInput

/**
 * Toast Component
 * - 개별 토스트 알림
 */

import { useEffect, useState } from 'react'
import { keyframes } from '@emotion/react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { useToastStore } from './toastStore'
import logger from '@core/utils/logger'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const slideIn = keyframes`
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
`

export const Toast = ({ id, type, message, onClick }) => {
  const [isExiting, setIsExiting] = useState(false)
  const removeToast = useToastStore((state) => state.removeToast)

  const tone = (() => {
    switch (type) {
      case 'success':
        return { border: '#22c55e', iconBg: '#22c55e' }
      case 'error':
        return { border: '#ef4444', iconBg: '#ef4444' }
      case 'warning':
        return { border: '#f97316', iconBg: '#f97316' }
      case 'info':
      default:
        return { border: '#2563eb', iconBg: '#2563eb' }
    }
  })()

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(id)
    }, 300) // 애니메이션 시간
  }

  const handlePaperClick = (e) => {
    // 닫기 버튼(IconButton)을 클릭한 경우는 제외
    if (e.target.closest('button')) return

    if (onClick) {
      logger.debug('Toast clicked, executing onClick handler')
      onClick()
    }
    handleClose()
  }

  useEffect(() => {
    // 자동 닫기 애니메이션 시작
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, 2700) // duration - 300ms

    return () => clearTimeout(timer)
  }, [])

  return (
    <Paper
      role="alert"
      onClick={handlePaperClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        bgcolor: 'common.white',
        borderRadius: 2,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)', // 더 선명한 그림자
        minWidth: { xs: 'auto', md: 320 },
        maxWidth: { xs: 'calc(100vw - 2rem)', md: 500 },
        pointerEvents: 'auto',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: '5px solid', // 더 두꺼운 테두리
        borderLeftColor: tone.border,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
        } : {},
        animation: `${isExiting ? slideOut : slideIn} 0.3s ${isExiting ? 'ease-in' : 'ease-out'} forwards`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: tone.iconBg,
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {ICONS[type] || 'ℹ'}
      </Box>

      <Typography variant="body2" sx={{ flex: 1, color: 'text.primary', lineHeight: 1.5 }}>
        {message}
      </Typography>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        aria-label="닫기"
        sx={{ color: 'text.disabled' }}
      >
        <Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
          ×
        </Box>
      </IconButton>
    </Paper>
  )
}

export default Toast

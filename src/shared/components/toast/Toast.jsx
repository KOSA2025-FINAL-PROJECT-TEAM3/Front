/**
 * Toast Component
 * - 개별 토스트 알림
 */

import { useEffect, useState } from 'react'
import { keyframes } from '@emotion/react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { useToastStore } from './toastStore'

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

export const Toast = ({ id, type, message }) => {
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
      onClick={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        bgcolor: 'common.white',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: { xs: 'auto', md: 300 },
        maxWidth: { xs: 'calc(100vw - 2rem)', md: 500 },
        pointerEvents: 'auto',
        cursor: 'pointer',
        borderLeft: '4px solid',
        borderLeftColor: tone.border,
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

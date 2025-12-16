/**
 * ToastContainer Component
 * - 토스트 알림을 화면에 표시
 */

import { Box } from '@mui/material'
import { useToastStore } from './toastStore'
import { Toast } from './Toast'

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pointerEvents: 'none',
        left: { xs: 16, md: 'auto' },
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </Box>
  )
}

export default ToastContainer

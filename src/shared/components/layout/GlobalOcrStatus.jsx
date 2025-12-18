import React, { useEffect } from 'react'
import { Box, Chip, CircularProgress, keyframes } from '@mui/material'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CancelIcon from '@mui/icons-material/Cancel'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@core/config/routes.config'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`

const GlobalOcrStatus = () => {
  const isOcrScanning = useNotificationStore((state) => state.isOcrScanning)
  const isDietAnalyzing = useNotificationStore((state) => state.isDietAnalyzing)
  const setOcrScanning = useNotificationStore((state) => state.setOcrScanning)
  const setDietAnalyzing = useNotificationStore((state) => state.setDietAnalyzing)
  const navigate = useNavigate()

  const isScanning = isOcrScanning || isDietAnalyzing

  // 안전장치: 3분(180초)이 지나도 안 꺼지면 자동으로 끔
  useEffect(() => {
    let timer
    if (isScanning) {
      timer = setTimeout(() => {
        if (isOcrScanning) setOcrScanning(false)
        if (isDietAnalyzing) setDietAnalyzing(false)
      }, 180000)
    }
    return () => clearTimeout(timer)
  }, [isScanning, isOcrScanning, isDietAnalyzing, setOcrScanning, setDietAnalyzing])

  const handleClose = (e) => {
    e.stopPropagation()
    if (window.confirm('분석 상태 표시를 닫으시겠습니까? (백그라운드 분석은 계속됩니다)')) {
      if (isOcrScanning) setOcrScanning(false)
      if (isDietAnalyzing) setDietAnalyzing(false)
    }
  }

  const handleClick = () => {
    if (isOcrScanning) {
      navigate(ROUTE_PATHS.ocrScan)
    } else if (isDietAnalyzing) {
      // 식단은 별도 진행 페이지가 없으므로 메인이나 식단 페이지로 이동
      navigate(ROUTE_PATHS.dietLog)
    }
  }

  if (!isScanning) return null

  const label = isOcrScanning ? '처방전 분석 중...' : '식단 분석 중...'
  const Icon = isOcrScanning ? AutoFixHighIcon : RestaurantIcon

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 80, md: 40 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <Chip
        icon={
          <Box sx={{ display: 'flex', position: 'relative' }}>
            <CircularProgress size={20} color="inherit" thickness={5} />
            <Icon
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 12,
                opacity: 0.5,
              }}
            />
          </Box>
        }
        label={label}
        onClick={handleClick}
        onDelete={handleClose}
        deleteIcon={<CancelIcon style={{ color: 'rgba(0,0,0,0.2)' }} />}
        sx={{
          pl: 0.5,
          pr: 1,
          py: 2.5,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          color: 'success.dark',
          fontWeight: 700,
          border: '1px solid',
          borderColor: 'success.light',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          animation: `${pulse} 2s infinite`,
          pointerEvents: 'auto',
          cursor: 'pointer',
          '& .MuiChip-icon': {
            color: 'success.main',
          },
          '& .MuiChip-deleteIcon': {
            color: 'success.light',
            '&:hover': {
              color: 'success.dark',
            }
          }
        }}
      />
    </Box>
  )
}

export default GlobalOcrStatus

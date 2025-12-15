import { Box, Button, IconButton, Typography } from '@mui/material'
import { useFocusModeStore } from '@shared/stores/focusModeStore'
import { useCallback, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment',
}

const CameraCapture = ({ onCapture, onCancel }) => {
  const webcamRef = useRef(null)
  const enterFocusMode = useFocusModeStore((state) => state.enterFocusMode)
  const exitFocusMode = useFocusModeStore((state) => state.exitFocusMode)

  useEffect(() => {
    enterFocusMode('camera')
    return () => exitFocusMode('camera')
  }, [enterFocusMode, exitFocusMode])

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot?.()
    if (!imageSrc) return

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' })
        onCapture?.(file)
      })
  }, [onCapture])

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            width: '80%',
            height: '60%',
            border: '2px solid #00ff00',
            borderRadius: 3,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pt: 2.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 2,
              py: 1,
              borderRadius: 999,
              fontWeight: 900,
            }}
          >
            처방전을 사각형 안에 맞춰주세요
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            position: 'absolute',
            left: 30,
            color: '#fff',
            fontWeight: 900,
          }}
        >
          취소
        </Button>

        <IconButton
          onClick={capture}
          aria-label="촬영"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#fff',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#fff',
              border: '2px solid #000',
            }}
          />
        </IconButton>
      </Box>
    </Box>
  )
}

export default CameraCapture

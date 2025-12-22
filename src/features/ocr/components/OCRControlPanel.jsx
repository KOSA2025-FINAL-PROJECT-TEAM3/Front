import { Button, Stack } from '@mui/material'

export const OCRControlPanel = ({ onRecognize, onReset, isProcessing }) => {
  return (
    <Stack direction="row" spacing={2}>
      <Button type="button" variant="contained" onClick={onRecognize} disabled={isProcessing} fullWidth sx={{ fontWeight: 900 }}>
        {isProcessing ? '인식 중...' : 'AI로 인식하기'}
      </Button>
      <Button type="button" variant="outlined" onClick={onReset} disabled={isProcessing} fullWidth sx={{ fontWeight: 900 }}>
        초기화
      </Button>
    </Stack>
  )
}

export default OCRControlPanel

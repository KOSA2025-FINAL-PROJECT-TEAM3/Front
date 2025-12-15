import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'

export const OCRResultPreview = ({ imageSrc, resultText, confidence, error }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          minHeight: 220,
          borderRadius: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageSrc ? (
          <Box component="img" src={imageSrc} alt="이미지 미리보기" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            이미지를 선택하면 미리보기를 제공합니다
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: 'grey.50', p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2 }}>
          인식 결과
        </Typography>

        {error ? (
          <Alert severity="error">
            <Stack spacing={0.75}>
              <Typography sx={{ fontWeight: 900 }}>❌ {error}</Typography>
              <Typography variant="body2" color="text.secondary">
                더 선명한 이미지를 사용하거나 조명을 개선해보세요.
              </Typography>
            </Stack>
          </Alert>
        ) : resultText ? (
          <Stack spacing={2}>
            <Chip
              label={`정확도: ${confidence}%`}
              size="small"
              sx={{ bgcolor: 'info.100', color: 'info.dark', fontWeight: 900, width: 'fit-content' }}
            />
            <Box
              component="pre"
              sx={{
                m: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'grey.100',
                fontSize: 14,
                lineHeight: 1.6,
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(148, 163, 184, 0.3)',
              }}
            >
              {resultText}
            </Box>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigator.clipboard.writeText(resultText)}
                sx={{ fontWeight: 900 }}
              >
                📋 텍스트 복사
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            텍스트 인식 결과가 여기에 표시됩니다.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default OCRResultPreview

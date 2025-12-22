/**
 * ErrorFallback Component
 * - ErrorBoundary에서 사용하는 에러 화면
 */

// import { useNavigate } from 'react-router-dom' // Removed
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'

export const ErrorFallback = ({ error, resetError }) => {
  // const navigate = useNavigate() // Removed

  const handleGoHome = () => {
    if (resetError) resetError()
    window.location.href = ROUTE_PATHS.seniorDashboard // Use window.location
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'grey.50',
      }}
    >
      <Paper sx={{ maxWidth: 640, width: '100%', borderRadius: 4, p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Box aria-hidden sx={{ fontSize: 40, mb: 1 }}>
          ⚠️
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          문제가 발생했습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          예상치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </Typography>

        {process.env.NODE_ENV === 'development' && error ? (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, textAlign: 'left', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
              오류 상세 정보 (개발 모드)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 12,
                color: 'text.secondary',
              }}
            >
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </Box>
          </Paper>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <Button onClick={handleGoHome} variant="contained">
            홈으로 이동
          </Button>
          <Button onClick={handleReload} variant="outlined">
            페이지 새로고침
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ErrorFallback

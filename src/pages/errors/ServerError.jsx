/**
 * ServerError Page (500)
 * - 서버 오류 발생 시 표시
 */

import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'

export const ServerError = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper sx={{ maxWidth: 520, width: '100%', borderRadius: 4, p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography sx={{ fontSize: { xs: 48, sm: 80 }, fontWeight: 900, color: '#667eea', lineHeight: 1 }}>
          500
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>
          서버 오류가 발생했습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          요청을 처리하는 중 예기치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도하거나 관리자에게 문의해 주세요.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <Button onClick={() => navigate(ROUTE_PATHS.root)} variant="contained">
            홈으로 이동
          </Button>
          <Button onClick={() => window.location.reload()} variant="outlined">
            페이지 새로고침
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ServerError

/**
 * NotFound Page (404)
 * - 요청하신 페이지를 찾을 수 없을 때 표시
 */

import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'

export const NotFound = () => {
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
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>
          페이지를 찾을 수 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <Button onClick={() => navigate(ROUTE_PATHS.root)} variant="contained">
            홈으로 이동
          </Button>
          <Button onClick={() => navigate(-1)} variant="outlined">
            이전 페이지로
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default NotFound

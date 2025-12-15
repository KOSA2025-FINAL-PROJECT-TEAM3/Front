/**
 * DeveloperModePanel
 * - 개발 모드 진입/바로가기 패널
 * - 실제 API 연동 환경에서는 단순 페이지 이동 숏컷 역할만 수행합니다.
 */

import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, IconButton, List, ListItemButton, ListItemText, Popover, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'

const DEV_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEV_MODE !== 'false'

const SHORTCUTS = [
  { label: '어르신 대시보드', path: ROUTE_PATHS.seniorDashboard },
  { label: '보호자 대시보드', path: ROUTE_PATHS.caregiverDashboard },
  { label: '주간 통계 (/reports/weekly)', path: ROUTE_PATHS.weeklyStats },
  { label: '알약 검색 결과 (/pills/result)', path: ROUTE_PATHS.pillResult },
  { label: '의심 질환 (/disease/suspected)', path: ROUTE_PATHS.suspectedDisease },
  { label: '질병별 제약 (/disease/restrictions)', path: ROUTE_PATHS.diseaseRestrictions },
  { label: '내 약 관리 (설정, /settings/medications)', path: ROUTE_PATHS.myMedicationsSettings },
  { label: '내 질병 관리 (설정, /settings/diseases)', path: ROUTE_PATHS.myDiseasesSettings },
]

export const DeveloperModePanel = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()

  if (!DEV_MODE_ENABLED) return null

  const open = Boolean(anchorEl)

  const handleShortcut = (path) => {
    setAnchorEl(null)
    navigate(path)
  }

  return (
    <Box sx={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1200 }}>
      <Button
        variant="contained"
        size="small"
        onClick={(e) => setAnchorEl((prev) => (prev ? null : e.currentTarget))}
        aria-expanded={open}
        sx={{
          borderRadius: 999,
          px: 2,
          py: 1,
          fontWeight: 900,
          boxShadow: '0 10px 25px rgba(30, 64, 175, 0.35)',
          bgcolor: '#1e40af',
          '&:hover': { bgcolor: '#1e40af' },
        }}
      >
        🧪 Dev Mode
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 280,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.15)',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 1.75,
            py: 1.25,
            color: '#fff',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            개발자 바로가기
          </Typography>
          <IconButton size="small" onClick={() => setAnchorEl(null)} aria-label="닫기" sx={{ color: '#bfdbfe' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <List dense sx={{ p: 1 }}>
          {SHORTCUTS.map((item) => (
            <ListItemButton key={item.path} onClick={() => handleShortcut(item.path)} sx={{ borderRadius: 2 }}>
              <ListItemText primaryTypographyProps={{ sx: { fontSize: 14 } }} primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </Box>
  )
}

export default DeveloperModePanel

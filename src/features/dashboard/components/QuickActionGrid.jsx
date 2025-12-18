/**
 * QuickActionGrid Component
 * - RN 프로토타입(어르신) 기준 빠른 실행 카드
 * - 2열(약품 검색/식단 기록) + 1열(가족 채팅방)
 */

import {
  Box,
  ButtonBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import SearchIcon from '@mui/icons-material/Search'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import ChatIcon from '@mui/icons-material/Chat'

export const QuickActionGrid = ({
  onSearchPill,
  dietPath,
  chatPath,
}) => {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <ButtonBase
          onClick={onSearchPill}
          sx={{
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: 'primary.main', color: 'common.white' },
            },
          }}
        >
          <Stack spacing={1.25} alignItems="center">
            <Box
              className="qa-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#F6FAFF',
                color: 'primary.main',
                transition: 'all 160ms ease',
              }}
            >
              <SearchIcon />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>약품 검색</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                무슨 약일까?
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>

        <ButtonBase
          onClick={() => {
            if (dietPath) window.location.href = dietPath
          }}
          sx={{
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: '#FBBF24',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: '#F59E0B', color: 'common.white' },
            },
          }}
        >
          <Stack spacing={1.25} alignItems="center">
            <Box
              className="qa-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FFFBEB',
                color: '#F59E0B',
                transition: 'all 160ms ease',
              }}
            >
              <RestaurantIcon />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>식단 기록</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                건강한 식습관
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>
      </Box>

      <ButtonBase
        onClick={() => {
          if (chatPath) window.location.href = chatPath
        }}
        sx={{
          borderRadius: 3.5,
          overflow: 'hidden',
          textAlign: 'left',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            p: 2.25,
            borderRadius: 3.5,
            bgcolor: '#FFFBEB',
            borderColor: '#FCD34D',
            transition: 'transform 160ms ease, box-shadow 160ms ease',
            '&:hover': {
              bgcolor: '#FEF3C7',
              transform: 'translateY(-1px)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'common.white',
                color: '#F59E0B',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ChatIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: '#B45309' }}>가족 채팅방</Typography>
              <Typography variant="body2" sx={{ color: '#D97706', fontWeight: 800 }}>
                우리 가족에게 안부 묻기
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </ButtonBase>
    </Stack>
  )
}

QuickActionGrid.propTypes = {
  onSearchPill: PropTypes.func.isRequired,
  dietPath: PropTypes.string.isRequired,
  chatPath: PropTypes.string.isRequired,
}

export default QuickActionGrid

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
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import SearchIcon from '@mui/icons-material/Search'
import ChatIcon from '@mui/icons-material/Chat'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CoronavirusIcon from '@mui/icons-material/Coronavirus'
import { memo } from 'react'

export const QuickActionGrid = memo(({
  onSearchPill,
  medicationPath,
  chatPath,
  onDietWarning,
  onDiseaseSearch,
}) => {
  return (
    <Stack spacing={2}>
      {/* Mobile: 1 Col (List), Desktop: 4 Col (Grid) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        {/* 1. 약/질병 검색 */}
        <ButtonBase
          onClick={onSearchPill}
          sx={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            height: '100%',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: 'primary.main', color: 'common.white' },
            },
          }}
        >
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            alignItems="center"
            spacing={{ xs: 2, md: 1.25 }}
            sx={{ width: '100%' }}
          >
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
                flexShrink: 0,
              }}
            >
              <SearchIcon />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>약/질병 검색</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                궁금한 증상/약 검색
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>

        {/* 2. 복약 관리 (구 식단 기록) */}
        <ButtonBase
          onClick={() => {
            if (medicationPath) window.location.href = medicationPath
          }}
          sx={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            height: '100%',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: '#6366F1',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: '#6366F1', color: 'common.white' },
            },
          }}
        >
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            alignItems="center"
            spacing={{ xs: 2, md: 1.25 }}
            sx={{ width: '100%' }}
          >
            <Box
              className="qa-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#EEF2FF',
                color: '#6366F1',
                transition: 'all 160ms ease',
                flexShrink: 0,
              }}
            >
              <LocalPharmacyIcon />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>복약 관리</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                내 약 관리하기
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>

        {/* 3. 식이 경고 */}
        <ButtonBase
          onClick={onDietWarning}
          sx={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            height: '100%',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: '#EF4444',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: '#EF4444', color: 'common.white' },
            },
          }}
        >
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            alignItems="center"
            spacing={{ xs: 2, md: 1.25 }}
            sx={{ width: '100%' }}
          >
            <Box
              className="qa-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FEF2F2',
                color: '#EF4444',
                transition: 'all 160ms ease',
                flexShrink: 0,
              }}
            >
              <WarningAmberIcon />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>식이 경고</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                주의할 음식
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>

        {/* 4. 질병 검색 */}
        <ButtonBase
          onClick={onDiseaseSearch}
          sx={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 3.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white',
            p: 2.25,
            height: '100%',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: '#10B981',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-1px)',
              '& .qa-icon': { bgcolor: '#10B981', color: 'common.white' },
            },
          }}
        >
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            alignItems="center"
            spacing={{ xs: 2, md: 1.25 }}
            sx={{ width: '100%' }}
          >
            <Box
              className="qa-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                transition: 'all 160ms ease',
                flexShrink: 0,
              }}
            >
              <CoronavirusIcon />
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: 'text.primary' }}>질병 검색</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                질병 정보 찾기
              </Typography>
            </Box>
          </Stack>
        </ButtonBase>
      </Box>

      {/* 가족 채팅방 (Full Width) */}
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
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
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
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
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
})

QuickActionGrid.propTypes = {
  onSearchPill: PropTypes.func.isRequired,
  dietPath: PropTypes.string.isRequired,
  chatPath: PropTypes.string.isRequired,
  onDietWarning: PropTypes.func, // New
  onDiseaseSearch: PropTypes.func, // New
}

export default QuickActionGrid

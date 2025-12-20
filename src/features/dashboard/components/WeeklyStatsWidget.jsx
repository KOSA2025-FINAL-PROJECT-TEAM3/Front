/**
 * WeeklyStatsWidget Component
 * - 주간 복약 통계 위젯
 * - 요일별 상태 아바타로 표시 (완료/예정/미복용)
 */

import {
  Box,
  Typography,
  Stack,
  Avatar,
  LinearProgress,
  ButtonBase,
} from '@mui/material'
import { RoundedCard } from '@shared/components/mui/RoundedCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PropTypes from 'prop-types'
import { memo } from 'react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={{ color: 'white' }} />
    case 'missed':
      return <CancelIcon sx={{ color: 'white' }} />
    case 'pending':
    default:
      return <ScheduleIcon sx={{ color: 'white' }} />
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success.main'
    case 'missed':
      return 'error.main'
    case 'pending':
    default:
      return 'warning.main'
  }
}

export const WeeklyStatsWidget = memo(({
  title = '지난 7일 기록',
  weeklyData = [],
  adherenceRate = 0,
  onClick,
}) => {
  return (
    <RoundedCard
      component={onClick ? ButtonBase : undefined}
      onClick={onClick}
      elevation={2}
      sx={{
        textAlign: 'left',
        p: { xs: 1.5, md: 2 }, // Reduced padding
        ...(onClick
          ? {
            cursor: 'pointer',
            '&:hover': { boxShadow: '0 14px 34px rgba(15, 23, 42, 0.10)' },
          }
          : null),
      }}
    >
      <Stack spacing={{ xs: 1, md: 1.5 }}> {/* Reduced spacing */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: 13, md: 18 } }}> {/* Reduced font */}
            {title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 13, md: 18 } }} color="primary">
            {adherenceRate}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={adherenceRate}
          sx={{
            height: { xs: 6, md: 6 }, // Reduced height
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }}
        />

        <Stack direction="row" justifyContent="space-between" sx={{ mt: { xs: 1, md: 1.5 } }}>
          {DAYS.map((day, index) => {
            const dayData = weeklyData[index] || { status: 'pending' }

            return (
              <Box key={day} sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: { xs: 28, md: 36 }, // Reduced size
                    height: { xs: 28, md: 36 }, // Reduced size
                    bgcolor: getStatusColor(dayData.status),
                    mb: { xs: 0.5, md: 0.5 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: 14, md: 20 }
                    }
                  }}
                >
                  {getStatusIcon(dayData.status)}
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, md: 11 } }}>
                  {day}
                </Typography>
              </Box>
            )
          })}
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 1.5, md: 3 }}
          sx={{
            mt: { xs: 1, md: 1 },
            justifyContent: 'center',
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">완료</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="caption" color="text.secondary">예정</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography variant="caption" color="text.secondary">미복용</Typography>
          </Stack>
        </Stack>
      </Stack>
    </RoundedCard>
  )
})

WeeklyStatsWidget.propTypes = {
  title: PropTypes.string,
  weeklyData: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.oneOf(['completed', 'pending', 'missed']),
    })
  ),
  adherenceRate: PropTypes.number,
  onClick: PropTypes.func,
}

export default WeeklyStatsWidget

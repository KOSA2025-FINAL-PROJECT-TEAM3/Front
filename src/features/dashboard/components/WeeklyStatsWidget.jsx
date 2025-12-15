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
} from '@mui/material'
import { RoundedCard } from '@shared/components/mui/RoundedCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PropTypes from 'prop-types'

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

export const WeeklyStatsWidget = ({
  title = '지난 7일 기록',
  weeklyData = [],
  adherenceRate = 0,
}) => {
  return (
    <RoundedCard elevation={2}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            {adherenceRate}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={adherenceRate}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }}
        />

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          {DAYS.map((day, index) => {
            const dayData = weeklyData[index] || { status: 'pending' }
            
            return (
              <Box key={day} sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: getStatusColor(dayData.status),
                    mb: 1,
                  }}
                >
                  {getStatusIcon(dayData.status)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {day}
                </Typography>
              </Box>
            )
          })}
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2">완료</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="body2">예정</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography variant="body2">미복용</Typography>
          </Stack>
        </Stack>
      </Stack>
    </RoundedCard>
  )
}

WeeklyStatsWidget.propTypes = {
  title: PropTypes.string,
  weeklyData: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.oneOf(['completed', 'pending', 'missed']),
    })
  ),
  adherenceRate: PropTypes.number,
}

export default WeeklyStatsWidget

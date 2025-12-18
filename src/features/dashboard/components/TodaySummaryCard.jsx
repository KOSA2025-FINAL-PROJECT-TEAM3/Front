import { Box, ButtonBase, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import PropTypes from 'prop-types'

export const TodaySummaryCard = ({ takenCount = 0, totalCount = 0, onClick }) => {
  const safeTotal = Math.max(0, totalCount || 0)
  const safeTaken = Math.min(Math.max(0, takenCount || 0), safeTotal || 0)
  const percent = safeTotal > 0 ? Math.round((safeTaken / safeTotal) * 100) : 0

  return (
    <Paper
      component={onClick ? ButtonBase : undefined}
      onClick={onClick}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        textAlign: 'left',
        ...(onClick
          ? {
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' },
            }
          : null),
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            오늘 요약
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
            {percent}%
          </Typography>
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            복용 완료 {safeTaken} / {safeTotal}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              mt: 1,
              height: 10,
              borderRadius: 999,
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  )
}

TodaySummaryCard.propTypes = {
  takenCount: PropTypes.number,
  totalCount: PropTypes.number,
  onClick: PropTypes.func,
}

export default TodaySummaryCard

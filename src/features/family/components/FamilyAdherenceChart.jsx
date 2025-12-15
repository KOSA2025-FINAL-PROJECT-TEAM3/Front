import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material'

export const FamilyAdherenceChart = ({ adherence = 0 }) => {
  const percent = Math.min(Math.max(adherence, 0), 100)
  return (
    <Paper component="section" variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: 'common.white' }}>
      <Stack spacing={1.25}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, m: 0 }}>
          복약 순응도
        </Typography>
        <Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 12,
              borderRadius: 999,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                background: 'linear-gradient(90deg, #34d399, #10b981)',
              },
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ m: 0 }}>
          {percent}% / 7일 기준
        </Typography>
      </Stack>
    </Paper>
  )
}

export default FamilyAdherenceChart

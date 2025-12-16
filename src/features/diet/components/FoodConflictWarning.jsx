import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

const severityLabel = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

export const FoodConflictWarning = ({ conflict }) => {
  if (!conflict) return null
  const { food, medication, severity, reason } = conflict

  const severityChipSx = (() => {
    switch (severity) {
      case 'high':
        return { bgcolor: 'error.100', color: 'error.dark' }
      case 'medium':
        return { bgcolor: 'warning.100', color: 'warning.dark' }
      case 'low':
        return { bgcolor: 'info.100', color: 'info.dark' }
      default:
        return { bgcolor: 'grey.100', color: 'text.secondary' }
    }
  })()

  return (
    <Paper
      component="section"
      sx={{
        borderRadius: 5,
        p: 2.5,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box aria-hidden sx={{ fontSize: 28 }}>
          ⚠️
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ m: 0, fontSize: 18, fontWeight: 900, color: 'error.dark' }}>
            주의! 음식-약물 상호작용
          </Typography>
          <Chip
            size="small"
            label={severityLabel[severity] || severity}
            sx={{ mt: 0.75, fontWeight: 800, ...severityChipSx }}
          />
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 1.75,
        }}
      >
        <Paper variant="outlined" sx={{ borderRadius: 3.5, p: 1.75 }}>
          <Typography variant="caption" sx={{ m: 0, fontSize: 13, color: 'text.secondary' }}>
            음식 정보
          </Typography>
          <Typography variant="subtitle1" sx={{ m: 0, mt: 0.75, fontSize: 16, fontWeight: 800 }}>
            {food.name}
          </Typography>
          <Typography variant="body2" sx={{ m: 0, mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
            {food.description}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3.5, p: 1.75 }}>
          <Typography variant="caption" sx={{ m: 0, fontSize: 13, color: 'text.secondary' }}>
            약 정보
          </Typography>
          <Typography variant="subtitle1" sx={{ m: 0, mt: 0.75, fontSize: 16, fontWeight: 800 }}>
            {medication.name}
          </Typography>
          <Typography variant="body2" sx={{ m: 0, mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
            {medication.dosage} · {medication.schedule}
          </Typography>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3.5, p: 1.75, bgcolor: 'grey.50' }}>
        <Typography variant="body2" sx={{ m: 0, fontSize: 14, color: 'text.primary' }}>
          {reason}
        </Typography>
      </Paper>
    </Paper>
  )
}

export default FoodConflictWarning

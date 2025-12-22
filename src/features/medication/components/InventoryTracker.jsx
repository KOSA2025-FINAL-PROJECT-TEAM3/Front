import { Box, Paper, Stack, Typography } from '@mui/material'

const formatDisplayDate = (isoString) => {
  if (!isoString) return '기록 없음'
  try {
    return new Date(isoString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export const InventoryTracker = ({ medications = [] }) => {
  const total = medications.length
  const active = medications.filter((med) => med.active).length
  const paused = total - active

  const lastUpdatedMed = medications.reduce(
    (latest, med) => {
      const candidate = med.updatedAt || med.createdAt
      if (!candidate) return latest
      if (!latest.value || new Date(candidate) > new Date(latest.value)) {
        return { value: candidate, name: med.name }
      }
      return latest
    },
    { value: null, name: null },
  )

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 2,
        mb: 2.5,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
          borderColor: 'divider',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 0.5 }}>
          등록된 약
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 32, fontWeight: 900, color: 'text.primary' }}>{total}</Typography>
        <Typography variant="caption" color="text.secondary">
          총 관리 대상
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
          borderColor: 'divider',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 0.5 }}>
          복용 중
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 32, fontWeight: 900, color: 'text.primary' }}>{active}</Typography>
        <Typography variant="caption" color="text.secondary">
          일시중지 {paused}건
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
          borderColor: 'divider',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          gridColumn: { xs: 'span 1', md: 'span 2' },
        }}
      >
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 0.5 }}>
          최근 업데이트
        </Typography>
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.75, color: 'text.primary' }}>
          {lastUpdatedMed.name ? (
            <>
              <Typography component="strong" sx={{ fontWeight: 900 }}>
                {lastUpdatedMed.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                · {formatDisplayDate(lastUpdatedMed.value)}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              기록 없음
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}

export default InventoryTracker

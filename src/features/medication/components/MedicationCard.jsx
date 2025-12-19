import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { memo } from 'react'

export const MedicationCard = memo(({ medication, onToggle, onRemove, onSelect }) => {
  const handleSelect = () => {
    onSelect?.(medication)
  }

  const handleToggle = (event) => {
    event.stopPropagation()
    onToggle?.(medication.id)
  }

  const handleRemove = (event) => {
    event.stopPropagation()
    onRemove?.(medication.id)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  return (
    <Paper
      component="article"
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1.5,
        bgcolor: 'common.white',
        borderRadius: 4,
        p: 2,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:focus-visible': { outline: '2px solid #2563eb', outlineOffset: '2px' },
        '&:hover': { borderColor: 'primary.100', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900 }} noWrap>
          {medication.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {medication.dosage} · {medication.schedule || '스케줄 없음'}
        </Typography>
        {medication.instructions ? (
          <Typography variant="body2" sx={{ mt: 0.5, color: 'warning.dark' }}>
            {medication.instructions}
          </Typography>
        ) : null}
      </Box>

      <Stack spacing={1} sx={{ minWidth: 160, alignItems: 'flex-end' }}>
        <Chip
          size="small"
          label={medication.active ? '복용 중' : '일시중지'}
          sx={{
            bgcolor: 'info.50',
            color: 'info.dark',
            fontWeight: 900,
          }}
        />
        <Stack spacing={0.75} sx={{ width: '100%' }}>
          <Button size="small" variant="outlined" onClick={handleToggle} sx={{ fontWeight: 900 }}>
            {medication.active ? '일시중지' : '복용 재개'}
          </Button>
          <Button size="small" color="error" variant="contained" onClick={handleRemove} sx={{ fontWeight: 900 }}>
            삭제
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
})

export default MedicationCard

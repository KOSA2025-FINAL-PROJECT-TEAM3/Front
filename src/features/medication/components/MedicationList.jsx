import MedicationCard from './MedicationCard.jsx'
import { Paper, Stack, Typography } from '@mui/material'

export const MedicationList = ({
  medications = [],
  onToggle,
  onRemove,
  onSelect,
}) => {
  if (!medications.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, borderStyle: 'dashed', bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          등록된 약이 없습니다. 약 등록 폼을 사용해 추가하세요.
        </Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={1.5}>
      {medications.map((med) => (
        <MedicationCard
          key={med.id}
          medication={med}
          onToggle={onToggle}
          onRemove={onRemove}
          onSelect={onSelect}
        />
      ))}
    </Stack>
  )
}

export default MedicationList

import { MEAL_TYPE_LABELS } from '@config/constants'
import { Card, CardContent, Typography, Box, Chip, IconButton, Stack } from '@mui/material'

// Fallback icons
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const MealCard = ({ meal, onEdit, onDelete }) => {
  const formattedDate = new Date(meal.recordedAt || meal.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Overall level에 따른 색상 및 라벨
  const getLevelConfig = (level) => {
    switch (level) {
      case 'GOOD':
        return { color: 'success', label: '안전' }
      case 'WARNING':
        return { color: 'warning', label: '주의' }
      case 'DANGER':
        return { color: 'error', label: '위험' }
      default:
        return { color: 'default', label: '분석 중' }
    }
  }

  const levelConfig = getLevelConfig(meal.overallLevel)

  return (
    <Card elevation={1} sx={{ mb: 2, borderRadius: 3, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
              <Chip
                label={MEAL_TYPE_LABELS[meal.mealType]}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'bold', borderRadius: 1 }}
              />
              {meal.overallLevel && (
                <Chip
                  label={levelConfig.label}
                  size="small"
                  color={levelConfig.color}
                  sx={{ fontWeight: 'bold', borderRadius: 1 }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {formattedDate}
              </Typography>
            </Stack>
            <Typography variant="h6" component="div" fontWeight="bold" mb={0.5}>
              {meal.foodName}
            </Typography>
            {meal.summary && (
              <Typography variant="body2" color="text.secondary" sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {meal.summary}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} ml={2}>
            <IconButton onClick={() => onEdit(meal)} size="small" sx={{ color: 'primary.main', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(meal.id)} size="small" sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MealCard

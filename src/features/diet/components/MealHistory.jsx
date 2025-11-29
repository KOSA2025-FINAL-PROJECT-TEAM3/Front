import { MealCard } from './MealCard'
import { Box, Typography, Divider } from '@mui/material'

export const MealHistory = ({ meals, onEdit, onDelete }) => {
  if (!meals || meals.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
          color: 'text.secondary'
        }}
      >
        <Typography variant="h6" gutterBottom>
          아직 기록된 식단이 없습니다.
        </Typography>
        <Typography variant="body2">
          식단을 추가하여 기록을 시작해보세요!
        </Typography>
      </Box>
    )
  }

  // 날짜별로 그룹화
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = new Date(meal.recordedAt || meal.createdAt)
    const dateKey = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(meal)
    return groups
  }, {})

  // 날짜 키를 정렬 (최신순)
  const sortedDateKeys = Object.keys(groupedMeals).sort((a, b) => {
    const dateA = new Date(groupedMeals[a][0].recordedAt || groupedMeals[a][0].createdAt)
    const dateB = new Date(groupedMeals[b][0].recordedAt || groupedMeals[b][0].createdAt)
    return dateB - dateA
  })

  return (
    <Box sx={{ mt: 3 }}>
      {sortedDateKeys.map((dateKey, index) => (
        <Box key={dateKey} sx={{ mb: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              {dateKey}
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {groupedMeals[dateKey].map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default MealHistory

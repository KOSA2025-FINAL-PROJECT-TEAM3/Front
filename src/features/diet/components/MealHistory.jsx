import { MealCard } from './MealCard'
import { Box, Typography } from '@mui/material'

export const MealHistory = ({ meals, onEdit, onDelete, readOnly = false, selectedDate = null }) => {
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
          {selectedDate ? '이 날짜의 기록된 식단이 없습니다.' : '아직 기록된 식단이 없습니다.'}
        </Typography>
        <Typography variant="body2">
          {selectedDate ? '다른 날짜를 선택해주세요.' : '식단을 추가하여 기록을 시작해보세요!'}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onEdit={onEdit}
          onDelete={onDelete}
          readOnly={readOnly}
        />
      ))}
    </Box>
  )
}

export default MealHistory

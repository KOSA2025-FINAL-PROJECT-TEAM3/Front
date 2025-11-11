import { MealCard } from './MealCard'
import styles from './MealHistory.module.scss'

export const MealHistory = ({ meals, onEdit, onDelete }) => {
  if (!meals || meals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>아직 기록된 식단이 없습니다.</p>
        <p>식단을 추가하여 기록을 시작해보세요!</p>
      </div>
    )
  }

  return (
    <div className={styles.mealHistory}>
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default MealHistory

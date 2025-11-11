import { MEAL_TYPE_LABELS } from '@config/constants'
import styles from './MealCard.module.scss'

export const MealCard = ({ meal, onEdit, onDelete }) => {
  const formattedDate = new Date(meal.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={styles.mealCard}>
      <div className={styles.header}>
        <span className={styles.mealType}>{MEAL_TYPE_LABELS[meal.mealType]}</span>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.foodName}>{meal.foodName}</p>
        <span className={styles.calories}>{meal.calories} kcal</span>
      </div>
      <div className={styles.actions}>
        <button onClick={() => onEdit(meal)} className={styles.editButton}>
          수정
        </button>
        <button onClick={() => onDelete(meal.id)} className={styles.deleteButton}>
          삭제
        </button>
      </div>
    </div>
  )
}

export default MealCard

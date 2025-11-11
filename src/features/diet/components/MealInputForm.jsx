import { useState, useEffect } from 'react'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@config/constants'
import styles from './MealInputForm.module.scss'

export const MealInputForm = ({
  onAddMeal,
  onUpdateMeal,
  editingMeal,
  onCancelEdit,
}) => {
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST)
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')

  const isEditing = !!editingMeal

  useEffect(() => {
    if (isEditing) {
      setMealType(editingMeal.mealType)
      setFoodName(editingMeal.foodName)
      setCalories(editingMeal.calories.toString())
    }
  }, [editingMeal, isEditing])

  const resetForm = () => {
    setMealType(MEAL_TYPES.BREAKFAST)
    setFoodName('')
    setCalories('')
    if (isEditing) {
      onCancelEdit()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!foodName.trim() || !calories.trim()) {
      alert('음식 이름과 칼로리를 입력해주세요.')
      return
    }
    const mealData = { mealType, foodName, calories: parseInt(calories, 10) }
    if (isEditing) {
      onUpdateMeal(editingMeal.id, mealData)
    } else {
      onAddMeal(mealData)
    }
    resetForm()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="mealType" className={styles.label}>
          식사 구분
        </label>
        <select
          id="mealType"
          className={styles.select}
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          {Object.values(MEAL_TYPES).map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="foodName" className={styles.label}>
          음식 이름
        </label>
        <input
          type="text"
          id="foodName"
          className={styles.input}
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="예: 사과, 계란후라이"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="calories" className={styles.label}>
          칼로리 (kcal)
        </label>
        <input
          type="number"
          id="calories"
          className={styles.input}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="예: 250"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton}>
          {isEditing ? '식단 수정' : '식단 추가'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className={styles.cancelButton}
          >
            취소
          </button>
        )}
      </div>
    </form>
  )
}

export default MealInputForm

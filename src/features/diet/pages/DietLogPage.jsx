import { useEffect, useState, useCallback } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { MealInputForm } from '../components/MealInputForm'
import { MealHistory } from '../components/MealHistory'
import { dietApiClient } from '@core/services/api/dietApiClient'
import styles from './DietLogPage.module.scss'

export const DietLogPage = () => {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMeal, setEditingMeal] = useState(null) // New state

  const fetchMeals = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedMeals = await dietApiClient.getDietLogs()
      setMeals(fetchedMeals)
    } catch (error) {
      console.error('Failed to fetch diet logs:', error)
      alert('식단 기록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const handleAddMeal = useCallback(
    async (newMeal) => {
      try {
        await dietApiClient.addDietLog(newMeal)
        fetchMeals() // Re-fetch to update the list
      } catch (error) {
        console.error('Failed to add diet log:', error)
        alert('식단 기록 추가에 실패했습니다.')
      }
    },
    [fetchMeals],
  )

  const handleDeleteMeal = useCallback(
    async (mealId) => {
      if (window.confirm('이 식단 기록을 삭제하시겠습니까?')) {
        try {
          await dietApiClient.deleteDietLog(mealId)
          fetchMeals() // Re-fetch to update the list
        } catch (error) {
          console.error('Failed to delete diet log:', error)
          alert('식단 기록 삭제에 실패했습니다.')
        }
      }
    },
    [fetchMeals],
  )

  // New handler for starting an edit
  const handleEditMeal = useCallback((meal) => {
    setEditingMeal(meal)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // New handler for canceling an edit
  const handleCancelEdit = useCallback(() => {
    setEditingMeal(null)
  }, [])

  // New handler for submitting an update
  const handleUpdateMeal = useCallback(
    async (mealId, updatedData) => {
      try {
        await dietApiClient.updateDietLog(mealId, updatedData)
        fetchMeals() // Re-fetch
      } catch (error) {
        console.error('Failed to update diet log:', error)
        alert('식단 기록 수정에 실패했습니다.')
      }
    },
    [fetchMeals],
  )

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>{editingMeal ? '식단 수정' : '식단 기록'}</h1>
          <p>
            {editingMeal
              ? '선택한 식단을 수정하세요.'
              : '오늘의 식단을 기록하고 관리하세요.'}
          </p>
        </header>

        <MealInputForm
          onAddMeal={handleAddMeal}
          onUpdateMeal={handleUpdateMeal}
          editingMeal={editingMeal}
          onCancelEdit={handleCancelEdit}
        />

        {loading ? (
          <div className={styles.hint}>식단 기록을 불러오는 중...</div>
        ) : (
          <MealHistory
            meals={meals}
            onEdit={handleEditMeal}
            onDelete={handleDeleteMeal}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default DietLogPage

import logger from "@core/utils/logger"
import { useEffect, useState, useCallback, useMemo } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { MealInputForm } from '../components/MealInputForm'
import { MealHistory } from '../components/MealHistory'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { Box, TextField, Stack, Typography, Divider } from '@mui/material'
import styles from './DietLogPage.module.scss'

export const DietLogPage = () => {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMeal, setEditingMeal] = useState(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // 오늘 날짜 기본값
  )
  const [allMeals, setAllMeals] = useState([])

  const fetchMeals = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedMeals = await dietApiClient.getDietLogs()
      setAllMeals(fetchedMeals)
    } catch (error) {
      logger.error('Failed to fetch diet logs:', error)
      alert('식단 기록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 선택된 날짜에 따라 식단 필터링
  const filteredMeals = useMemo(() => {
    if (!allMeals.length) return []

    return allMeals.filter((meal) => {
      const mealDate = new Date(meal.recordedAt || meal.createdAt)
        .toISOString()
        .split('T')[0]
      return mealDate === selectedDate
    })
  }, [allMeals, selectedDate])

  // 날짜 비교 함수
  const getTodayDate = () => new Date().toISOString().split('T')[0]
  const today = getTodayDate()
  const isToday = selectedDate === today
  const isFuture = selectedDate > today
  const isPast = selectedDate < today

  useEffect(() => {
    setMeals(filteredMeals)
  }, [filteredMeals])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const handleAddMeal = useCallback(
    async (newMeal) => {
      try {
        await dietApiClient.addDietLog(newMeal)
        setEditingMeal(null) // Reset form after successful submission
        fetchMeals() // Re-fetch to update the list
      } catch (error) {
        logger.error('Failed to add diet log:', error)
        alert('식단 기록 추가에 실패했습니다.')
      }
    },
    [fetchMeals],
  )

  const handleDeleteMeal = useCallback(
    async (mealId) => {
      // 오늘이 아닌 경우 삭제 불가능
      if (!isToday) {
        const message = isFuture
          ? '미래 날짜의 식단은 삭제할 수 없습니다.'
          : '과거 식단은 삭제할 수 없습니다.'
        alert(message)
        return
      }

      if (window.confirm('이 식단 기록을 삭제하시겠습니까?')) {
        try {
          await dietApiClient.deleteDietLog(mealId)
          fetchMeals() // Re-fetch to update the list
        } catch (error) {
          logger.error('Failed to delete diet log:', error)
          alert('식단 기록 삭제에 실패했습니다.')
        }
      }
    },
    [isToday, isFuture, fetchMeals],
  )

  // 오늘 식단만 수정 가능
  const handleEditMeal = useCallback((meal) => {
    if (!isToday) {
      const message = isFuture
        ? '미래 날짜의 식단은 수정할 수 없습니다.'
        : '과거 식단은 수정할 수 없습니다.'
      alert(message)
      return
    }
    setEditingMeal(meal)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [isToday, isFuture])

  // New handler for canceling an edit
  const handleCancelEdit = useCallback(() => {
    setEditingMeal(null)
  }, [])

  // New handler for submitting an update
  const handleUpdateMeal = useCallback(
    async (mealId, updatedData) => {
      try {
        await dietApiClient.updateDietLog(mealId, updatedData)
        setEditingMeal(null) // Reset form after successful submission
        fetchMeals() // Re-fetch
      } catch (error) {
        logger.error('Failed to update diet log:', error)
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

        {/* 날짜 선택기 & 날짜 표시 통합 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: 180 }}
            />
            <Typography variant="subtitle2" fontWeight="bold">
              {isToday ? '📅 오늘' : isPast ? '📅 과거' : '📅 미래'} {new Date(selectedDate).toLocaleDateString('ko-KR', { weekday: 'long' })}
            </Typography>
            <Divider orientation="vertical" sx={{ my: 1 }} />
            {!isToday && (
              <Typography
                variant="caption"
                sx={{
                  ml: 'auto',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: isFuture ? 'info.50' : 'warning.50',
                  color: isFuture ? 'info.dark' : 'warning.dark',
                }}
              >
                {isFuture
                  ? '🔮 미래 날짜는 식단을 추가할 수 없습니다.'
                  : '⏰ 과거 식단은 수정/삭제할 수 없습니다.'}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* 오늘 날짜일 때만 입력 폼 표시 */}
        {isToday && (
          <MealInputForm
            onAddMeal={handleAddMeal}
            onUpdateMeal={handleUpdateMeal}
            editingMeal={editingMeal}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {loading ? (
          <div className={styles.hint}>식단 기록을 불러오는 중...</div>
        ) : meals.length === 0 ? (
          <div className={styles.hint}>
            {isToday ? '오늘의 식단을 추가하세요.' : '이 날짜의 기록된 식단이 없습니다.'}
          </div>
        ) : (
          <MealHistory
            meals={meals}
            onEdit={handleEditMeal}
            onDelete={handleDeleteMeal}
            readOnly={!isToday}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default DietLogPage

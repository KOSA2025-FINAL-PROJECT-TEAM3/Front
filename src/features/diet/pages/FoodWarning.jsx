import logger from "@core/utils/logger"
import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { dietApiClient } from '@/core/services/api/dietApiClient'
import { CircularProgress, Alert, Box, Typography, Stack } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { MealHistory } from '../components/MealHistory'
import { toast } from '@shared/components/toast/toastStore'

export const FoodWarningPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allMeals, setAllMeals] = useState([])

  const fetchMeals = async () => {
    try {
      setLoading(true)
      const logs = await dietApiClient.getDietLogs()
      setAllMeals(logs || [])
    } catch (err) {
      logger.error('Failed to fetch diet logs:', err)
      setError('식단 기록을 불러오는데 실패했습니다.')
      toast.error('식단 기록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  // Group meals by date
  const groupedMeals = useMemo(() => {
    const groups = {}
    allMeals.forEach((meal) => {
      const date = new Date(meal.recordedAt || meal.createdAt || Date.now()).toISOString().split('T')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(meal)
    })

    // Sort within groups
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt))
    })

    return groups
  }, [allMeals])

  const sortedDates = useMemo(() => {
    return Object.keys(groupedMeals).sort((a, b) => new Date(b) - new Date(a));
  }, [groupedMeals]);

  const getTodayDate = () => new Date().toISOString().split('T')[0]
  const today = getTodayDate()

  // History page is read-only for now, or we could implement delete/edit redirection
  const handleDeleteMeal = async (mealId) => {
    const meal = allMeals.find(m => m.id === mealId)
    if (!meal) return

    const mealDate = new Date(meal.recordedAt || meal.createdAt).toISOString().split('T')[0]
    if (mealDate !== today) {
      toast.info(mealDate > today ? '미래 날짜의 식단은 삭제할 수 없습니다.' : '과거 식단은 삭제할 수 없습니다.')
      return
    }

    if (window.confirm('이 식단 기록을 삭제하시겠습니까?')) {
      try {
        await dietApiClient.deleteDietLog(mealId)
        fetchMeals()
      } catch (error) {
        logger.error('Failed to delete diet log:', error)
        toast.error('식단 기록 삭제에 실패했습니다.')
      }
    }
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="식단 히스토리"
          subtitle="기록된 모든 식단을 날짜별로 확인하세요."
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : sortedDates.length === 0 ? (
          <Alert severity="info">기록된 식단이 없습니다.</Alert>
        ) : (
          <Stack spacing={4}>
            {sortedDates.map((date) => (
              <Box key={date}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.secondary', mb: 1, px: 1 }}>
                  {date === today ? `오늘 (${date})` : `${date} (${new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' })})`}
                </Typography>
                <MealHistory
                  meals={groupedMeals[date]}
                  onDelete={handleDeleteMeal}
                  readOnly={date !== today}
                  selectedDate={date}
                />
              </Box>
            ))}
          </Stack>
        )}
      </PageStack>
    </MainLayout>
  )
}

export default FoodWarningPage

import logger from "@core/utils/logger"
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MealInputForm } from '../components/MealInputForm'
import { MealHistory } from '../components/MealHistory'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore'
import { Box, Divider, TextField, Stack, Typography, Alert, Button, Collapse } from '@mui/material'
import { toast } from '@shared/components/toast/toastStore'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

export const DietLogPage = () => {
  const location = useLocation()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMeal, setEditingMeal] = useState(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // 오늘 날짜 기본값
  )
  const [allMeals, setAllMeals] = useState([])

  // Recovery State
  const [recoveredJob, setRecoveredJob] = useState(null)
  const [initialAnalysis, setInitialAnalysis] = useState(null)

  // Voice Action State
  const [autoFillData, setAutoFillData] = useState(null)
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const { consumeAction } = useVoiceActionStore()

  useEffect(() => {
    const navAutoFill = location.state?.autoFillData
    if (navAutoFill && (navAutoFill.foodName || navAutoFill.mealType)) {
      setAutoFillData(navAutoFill)
    }
    // Location state로 전달된 초기 분석 결과가 있으면 설정
    if (location.state?.initialAnalysisResult) {
      setInitialAnalysis(location.state.initialAnalysisResult)
    }
  }, [location.state])

  // [Recovery] Check for pending analysis job
  useEffect(() => {
    const checkRecovery = async () => {
      const lastJobId = localStorage.getItem('last_diet_job_id')
      if (!lastJobId) return

      try {
        const resp = await dietApiClient.getAnalysisJob(lastJobId)
        const jobData = (resp && resp.data) ? resp.data : resp // Handle axios wrapper

        if (jobData && jobData.status === 'DONE' && jobData.result) {
          logger.info('Found recoverable diet job:', jobData)
          setRecoveredJob({
            id: lastJobId,
            result: jobData.result
          })
        } else if (jobData && jobData.status === 'FAILED') {
          localStorage.removeItem('last_diet_job_id') // Clean up failed job
        }
      } catch (error) {
        logger.warn('Failed to check recovery job:', error)
        // 404 등 에러 시 cleanup
        localStorage.removeItem('last_diet_job_id')
      }
    }

    checkRecovery()
  }, [])

  const handleApplyRecovery = () => {
    if (recoveredJob && recoveredJob.result) {
      setInitialAnalysis(recoveredJob.result)
      setRecoveredJob(null)
      localStorage.removeItem('last_diet_job_id')
      toast.success('분석 결과를 불러왔습니다.')
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDiscardRecovery = () => {
    setRecoveredJob(null)
    localStorage.removeItem('last_diet_job_id')
  }

  // Voice Command Handling (Auto Fill)
  useEffect(() => {
    if (pendingAction && pendingAction.code === 'AUTO_LOG_DIET') {
      const action = consumeAction('AUTO_LOG_DIET')
      if (action && action.params) {
        logger.info('🎤 Voice Action Auto-Fill:', action)
        setAutoFillData({
          foodName: action.params.foodName,
          mealType: action.params.mealType
        })
      }
    }
  }, [pendingAction, consumeAction])

  const fetchMeals = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedMeals = await dietApiClient.getDietLogs()
      setAllMeals(fetchedMeals)
    } catch (error) {
      logger.error('Failed to fetch diet logs:', error)
      toast.error('식단 기록을 불러오는데 실패했습니다.')
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
        toast.error('식단 기록 추가에 실패했습니다.')
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
        toast.info(message)
        return
      }

      if (window.confirm('이 식단 기록을 삭제하시겠습니까?')) {
        try {
          await dietApiClient.deleteDietLog(mealId)
          fetchMeals() // Re-fetch to update the list
        } catch (error) {
          logger.error('Failed to delete diet log:', error)
          toast.error('식단 기록 삭제에 실패했습니다.')
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
      toast.info(message)
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
        toast.error('식단 기록 수정에 실패했습니다.')
      }
    },
    [fetchMeals],
  )

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title={editingMeal ? '식단 수정' : '식단 기록'}
          subtitle={editingMeal ? '선택한 식단을 수정하세요.' : '오늘의 식단을 기록하고 관리하세요.'}
        />

        {/* Recovery Alert */}
        <Collapse in={!!recoveredJob}>
          {recoveredJob && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button color="inherit" size="small" onClick={handleDiscardRecovery}>
                    무시
                  </Button>
                  <Button variant="contained" color="primary" size="small" onClick={handleApplyRecovery}>
                    불러오기
                  </Button>
                </Stack>
              }
            >
              방금 분석 완료된 식단 결과가 있습니다.
            </Alert>
          )}
        </Collapse>

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
            autoFillData={autoFillData}
            initialAnalysisResult={initialAnalysis}
          />
        )}

        {loading ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>
            식단 기록을 불러오는 중...
          </Typography>
        ) : meals.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>
            {isToday ? '오늘의 식단을 추가하세요.' : '이 날짜의 기록된 식단이 없습니다.'}
          </Typography>
        ) : (
          <MealHistory
            meals={meals}
            onEdit={handleEditMeal}
            onDelete={handleDeleteMeal}
            readOnly={!isToday}
            selectedDate={selectedDate}
          />
        )}
      </PageStack>
    </MainLayout>
  )
}

export default DietLogPage

import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@core/config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import { useState, useEffect, useRef } from 'react'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@config/constants'
import { dietApiClient } from '@core/services/api/dietApiClient'
import DietCamera from './DietCamera'
import DietAnalysisModal from './DietAnalysisModal'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Chip,
  Box,
  Stack
} from '@mui/material'
import logger from '@core/utils/logger'

export const MealInputForm = ({
  onAddMeal,
  onUpdateMeal,
  editingMeal,
  onCancelEdit,
  autoFillData, // [Voice] New prop
  initialAnalysisResult,
  isModal = false, // [Refactor] Support modal mode
}) => {
  const navigate = useNavigate()
  const dietCameraRef = useRef(null)
  const dietJobs = useNotificationStore((state) => state.dietJobs)
  const setDietAnalyzing = useNotificationStore((state) => state.setDietAnalyzing)
  const dietJobsRef = useRef({})
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST)
  const [foodName, setFoodName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // Analysis state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)


  const isEditing = !!editingMeal

  const extractPayload = (resp) => (resp && resp.data) ? resp.data : resp

  useEffect(() => {
    dietJobsRef.current = dietJobs || {}
  }, [dietJobs])

  /* 
  // [Modified] Remove SSE listener within the form to prevent interfering with navigation.
  // Results are handled via global notifications or recovery logic on page re-entry.
  useEffect(() => {
    const jobId = currentJobIdRef.current
    if (!jobId) return
    const job = dietJobs?.[jobId]
    if (!job) return
    if (job.status === 'DONE' && job.result) {
      setAnalysisResult(job.result)
      setAnalysisError(null)
      setIsLoading(false)
      setIsModalOpen(true)
    } else if (job.status === 'FAILED') {
      setAnalysisError(job.error || '분석에 실패했습니다.')
      setIsLoading(false)
      setIsModalOpen(true)
    }
  }, [dietJobs])
  */

  // [Voice] Auto-fill effect
  useEffect(() => {
    if (autoFillData) {
      if (autoFillData.foodName) {
        setFoodName(autoFillData.foodName)
      }

      if (autoFillData.mealType) {
        const typeKey = Object.keys(MEAL_TYPES).find(key => key === autoFillData.mealType.toUpperCase())
        const mappedType = typeKey ? MEAL_TYPES[typeKey] : MEAL_TYPES.BREAKFAST
        setMealType(mappedType)
      }
    }
  }, [autoFillData])

  useEffect(() => {
    if (!initialAnalysisResult || isEditing) return
    setAnalysisResult(initialAnalysisResult)

    if (initialAnalysisResult.foodName) {
      setFoodName(initialAnalysisResult.foodName)
    }
    if (initialAnalysisResult.mealType) {
      setMealType(initialAnalysisResult.mealType)
    }

    if (initialAnalysisResult.imageUrl) {
      setImageUrl(initialAnalysisResult.imageUrl)
      setImagePreview(initialAnalysisResult.imageUrl)
    }

    // [Recovery] Open modal automatically to show full details (nutrients, warnings, etc.)
    setIsModalOpen(true)
    setIsLoading(false)
    setAnalysisError(null)
  }, [initialAnalysisResult, isEditing])

  useEffect(() => {
    if (isEditing) {
      setMealType(editingMeal.mealType)
      setFoodName(editingMeal.foodName)
      const existingImage = editingMeal.imageUrl || ''
      setImageUrl(existingImage)
      setImagePreview(existingImage)

      // [Fix] Restore analysis result from existing meal data so it doesn't get wiped on update
      try {
        setAnalysisResult({
          isFood: true, // Existing meals must be food
          foodName: editingMeal.foodName,
          mealType: editingMeal.mealType,
          overallLevel: editingMeal.overallLevel,
          summary: editingMeal.summary,
          // Parse JSON strings back to arrays if needed
          drugInteractions: typeof editingMeal.drugInteractions === 'string'
            ? JSON.parse(editingMeal.drugInteractions)
            : (editingMeal.drugInteractions || []),
          diseaseInteractions: typeof editingMeal.diseaseInteractions === 'string'
            ? JSON.parse(editingMeal.diseaseInteractions)
            : (editingMeal.diseaseInteractions || [])
        })
      } catch (e) {
        logger.error('Failed to restore analysis result from editingMeal', e)
        // Fallback to avoid breaking the form, but level might be lost
      }
    }
  }, [editingMeal, isEditing])

  const resetForm = () => {
    setMealType(MEAL_TYPES.BREAKFAST)
    setFoodName('')
    setImageUrl('')
    setImagePreview('')
    setSelectedFile(null)
    setAnalysisResult(null)
    // DietCamera 초기화
    if (dietCameraRef.current) {
      dietCameraRef.current.clear()
    }
    if (isEditing) {
      onCancelEdit()
    }
  }

  // Check if food is recognized
  const isNotFood = analysisResult?.isFood === false || foodName === '알 수 없음'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!foodName.trim()) {
      alert('음식 이름을 입력해주세요.')
      return
    }
    // Prevent submission if not recognized as food
    if (isNotFood) {
      alert('음식으로 인식되지 않아 등록할 수 없습니다.')
      return
    }
    const mealData = {
      mealType,
      foodName,
      imageUrl,
      // Include analysis results if available
      overallLevel: analysisResult?.overallLevel || null,
      summary: analysisResult?.summary || null,
      drugInteractions: analysisResult?.drugInteractions ? JSON.stringify(analysisResult.drugInteractions) : null,
      diseaseInteractions: analysisResult?.diseaseInteractions ? JSON.stringify(analysisResult.diseaseInteractions) : null
    }
    if (isEditing) {
      onUpdateMeal(editingMeal.id, mealData)
    } else {
      onAddMeal(mealData)
    }
    resetForm()
  }

  const handleImageCapture = async (file, previewUrl) => {
    if (!file) {
      setImageUrl('')
      setImagePreview('')
      setSelectedFile(null)
      return
    }

    setImagePreview(previewUrl || '')
    setSelectedFile(file)

    // 먼저 이미지 업로드 (실패해도 식단 기록은 이미지 없이 진행 가능)
    try {
      const uploadResp = extractPayload(await dietApiClient.uploadDietImage(file))
      const uploadedUrl = uploadResp?.imageUrl || uploadResp?.url || uploadResp
      if (uploadedUrl) {
        setImageUrl(uploadedUrl)
      } else {
        console.warn('Unexpected upload response', uploadResp)
      }
    } catch (error) {
      console.error('Failed to upload diet image:', error)
      setImageUrl('')
      // 업로드 실패 시에도 분석은 진행할 수 있도록 경고만 표시
    }
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile && !foodName.trim()) {
      alert('음식 사진을 등록하거나 이름을 입력해주세요.')
      return
    }

    // 1. 즉시 알림 및 이동 (Fire and Forget)
    setDietAnalyzing(true)
    toast.success('분석이 시작되었습니다. 다른 작업을 하셔도 됩니다.')
    if (!isModal) {
      navigate(ROUTE_PATHS.root)
    }

    // 2. 백그라운드에서 API 호출
    try {
      logger.info('Starting diet analysis in background...', { hasFile: !!selectedFile, foodName, mealType })
      let response
      if (selectedFile) {
        response = await dietApiClient.startAnalysisJob(selectedFile, mealType, '')
      } else {
        response = await dietApiClient.startAnalysisJob(null, mealType, foodName)
      }

      // Handle Axios response wrapper
      const data = (response && response.data) ? response.data : response
      const jobId = data?.jobId || data?.id || data?.result?.jobId

      if (jobId) {
        // [Recovery] Save jobId
        localStorage.setItem('last_diet_job_id', jobId)
        logger.info('Diet Analysis Job Started Successfully (Background):', jobId)
      } else {
        throw new Error('No Job ID returned')
      }

    } catch (error) {
      // 이미 화면을 벗어났으므로 조용히 로그만 남기거나, 
      // 정말 중요한 에러라면 전역 알림을 띄울 수 있음.
      logger.error('Failed to start diet analysis (Background):', error)
      // 사용자가 이미 다른 화면에 있으므로 실패 알림이 뜬금없을 수 있으나, 알려주는 게 좋음
      toast.error('분석 요청 중 오류가 발생했습니다.')
      setDietAnalyzing(false)
    }
  }

  const handleRetry = async () => {
    await handleStartAnalysis()
  }

  const handleAnalysisSave = (result) => {
    setFoodName(result.foodName)
    setMealType(result.mealType)
    setAnalysisResult(result)
    setIsModalOpen(false)
    // Note: form will be reset after successful submission in handleSubmit
  }


  const content = (
    <Box sx={{ p: isModal ? 0 : 3 }}>
      <DietCamera
        ref={dietCameraRef}
        onImageCapture={handleImageCapture}
        initialPreview={imagePreview}
      />

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Meal Type Selection */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
            식사 구분
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.values(MEAL_TYPES).map((type) => (
              <Chip
                key={type}
                label={MEAL_TYPE_LABELS[type]}
                onClick={() => setMealType(type)}
                color={mealType === type ? 'primary' : 'default'}
                variant={mealType === type ? 'filled' : 'outlined'}
                clickable
                sx={{
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                  fontWeight: mealType === type ? 'bold' : 'normal'
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Food Name Input */}
        <TextField
          label={analysisResult ? '인식된 음식 이름' : '음식 이름'}
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder={analysisResult ? "GPT가 인식한 음식명" : "예: 사과, 계란후라이"}
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 3 }
          }}
        />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          {!analysisResult && (
            <Button
              type="button"
              onClick={handleStartAnalysis}
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              음식 분석하기
            </Button>
          )}

          {/* Warning when isFood is false */}
          {isNotFood && (
            <Typography variant="body2" color="error" sx={{ width: '100%', textAlign: 'center' }}>
              ⚠️ 음식으로 인식되지 않아 등록할 수 없습니다.
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isNotFood}
            sx={{ borderRadius: 3, py: 1.5, boxShadow: 2 }}
          >
            {isEditing ? '식단 수정 완료' : '식단 추가하기'}
          </Button>

          {isEditing && (
            <Button
              type="button"
              onClick={resetForm}
              variant="text"
              color="inherit"
              sx={{ borderRadius: 3 }}
            >
              취소
            </Button>
          )}
        </Stack>
      </Box>

      <DietAnalysisModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setAnalysisError(null) }}
        analysisResult={analysisResult}
        onSave={handleAnalysisSave}
        isLoading={isLoading}
        errorMessage={analysisError}
        onRetry={!isLoading ? handleRetry : null}
      />
    </Box>
  )

  if (isModal) {
    return content
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 4, mb: 4 }}>
      <CardContent sx={{ p: 0 }}>
        {content}
      </CardContent>
    </Card>
  )
}

export default MealInputForm
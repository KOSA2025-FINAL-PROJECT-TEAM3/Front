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

  // Analysis state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const lastRequestRef = useRef(null)
  const currentJobIdRef = useRef(null)

  const isEditing = !!editingMeal

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const extractPayload = (resp) => (resp && resp.data) ? resp.data : resp

  useEffect(() => {
    dietJobsRef.current = dietJobs || {}
  }, [dietJobs])

  const pollAnalysisJob = async (jobId) => {
    const maxAttempts = 20
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const sseJob = dietJobsRef.current?.[jobId]
      if (sseJob) {
        if (sseJob.status === 'DONE') {
          return sseJob.result
        }
        if (sseJob.status === 'FAILED') {
          throw new Error(sseJob.error || '분석에 실패했습니다')
        }
      }
      const resp = extractPayload(await dietApiClient.getAnalysisJob(jobId))
      if (resp.status === 'DONE') {
        return resp.result
      }
      if (resp.status === 'FAILED') {
        throw new Error(resp.error || '분석에 실패했습니다')
      }
      await wait(1000)
    }
    throw new Error('분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')
  }

  // SSE로 완료된 Job 결과 감지 시 현재 Job과 일치하면 즉시 반영
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
  }, [initialAnalysisResult, isEditing])

  useEffect(() => {
    if (isEditing) {
      setMealType(editingMeal.mealType)
      setFoodName(editingMeal.foodName)
      const existingImage = editingMeal.imageUrl || ''
      setImageUrl(existingImage)
      setImagePreview(existingImage)
    }
  }, [editingMeal, isEditing])

  const resetForm = () => {
    setMealType(MEAL_TYPES.BREAKFAST)
    setFoodName('')
    setImageUrl('')
    setImagePreview('')
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
      return
    }

    setImagePreview(previewUrl || '')

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
      setAnalysisError('이미지 업로드에 실패했습니다. 분석은 계속 진행합니다.')
      setIsModalOpen(true)
    }

    // 분석 시작 (비동기)
    try {
      setDietAnalyzing(true)
      
      // 이미지 분석 Job: 식사구분 + 이미지
      const jobResp = extractPayload(await dietApiClient.startAnalysisJob(file, mealType, ''))
      const jobId = jobResp.jobId
      
      logger.info('Diet Analysis Job Started:', jobId)
      toast.success('식단 분석이 시작되었습니다. 다른 작업을 하셔도 됩니다.')
      
      // 메인 화면으로 이동 (또는 현재 화면 유지)
      // 식단은 보통 연속해서 올리지 않으므로 메인으로 가는게 자연스러울 수 있음
      navigate(ROUTE_PATHS.root)
      
    } catch (error) {
      logger.error('Failed to start diet analysis:', error)
      toast.error(error.message || '식단 분석 요청에 실패했습니다.')
      setDietAnalyzing(false)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false) // 모달 닫기 (비동기라 필요 없음)
    }
  }

  const handleTextAnalysis = async () => {
    if (!foodName.trim()) {
      alert('음식 이름을 입력해주세요.')
      return
    }

    try {
      setDietAnalyzing(true)
      
      // 텍스트 분석 Job: 식사구분 + 음식 이름
      const jobResp = extractPayload(await dietApiClient.startAnalysisJob(null, mealType, foodName))
      const jobId = jobResp.jobId
      
      logger.info('Diet Text Analysis Job Started:', jobId)
      toast.success('음식 분석이 시작되었습니다. 잠시만 기다려주세요.')
      
      navigate(ROUTE_PATHS.root)

    } catch (error) {
      logger.error('Failed to analyze food:', error)
      toast.error(error.message || '음식 분석 요청에 실패했습니다.')
      setDietAnalyzing(false)
    }
  }

  const handleRetry = async () => {
    const req = lastRequestRef.current
    if (!req) {
      setAnalysisError('다시 시도할 요청이 없습니다.')
      return
    }
    if (req.type === 'image') {
      await handleImageCapture(req.file, imagePreview || imageUrl)
    } else {
      await handleTextAnalysis()
    }
  }

  const handleAnalysisSave = (result) => {
    setFoodName(result.foodName)
    setMealType(result.mealType)
    setIsModalOpen(false)
    // Note: form will be reset after successful submission in handleSubmit
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 4, mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
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
            {!imageUrl && !analysisResult && (
              <Button
                type="button"
                onClick={handleTextAnalysis}
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
      </CardContent>
    </Card>
  )
}

export default MealInputForm

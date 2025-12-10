import { useState, useEffect, useRef } from 'react'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@config/constants'
import { dietApiClient } from '@core/services/api/dietApiClient'
import DietCamera from './DietCamera'
import DietAnalysisModal from './DietAnalysisModal'
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Chip,
  Box,
  Stack,
  CircularProgress
} from '@mui/material'
import logger from '@core/utils/logger'

export const MealInputForm = ({
  onAddMeal,
  onUpdateMeal,
  editingMeal,
  onCancelEdit,
  autoFillData // [Voice] New prop
}) => {
  const dietCameraRef = useRef(null)
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST)
  const [foodName, setFoodName] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Analysis state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!editingMeal

  // [Voice] Auto-fill effect
  useEffect(() => {
    if (autoFillData) {
      if (autoFillData.foodName) {
        setFoodName(autoFillData.foodName)
      }
      
      if (autoFillData.mealType) {
        // Map uppercase backend enum (e.g., 'LUNCH') to lowercase frontend constant
        const typeKey = Object.keys(MEAL_TYPES).find(key => key === autoFillData.mealType.toUpperCase())
        const mappedType = typeKey ? MEAL_TYPES[typeKey] : MEAL_TYPES.BREAKFAST
        
        setMealType(mappedType)
      }
    }
  }, [autoFillData])

  useEffect(() => {
    if (isEditing) {
      setMealType(editingMeal.mealType)
      setFoodName(editingMeal.foodName)
      setImageUrl(editingMeal.imageUrl || '')
    }
  }, [editingMeal, isEditing])

  const resetForm = () => {
    setMealType(MEAL_TYPES.BREAKFAST)
    setFoodName('')
    setImageUrl('')
    setAnalysisResult(null)
    // DietCamera 초기화
    if (dietCameraRef.current) {
      dietCameraRef.current.clear()
    }
    if (isEditing) {
      onCancelEdit()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!foodName.trim()) {
      alert('음식 이름을 입력해주세요.')
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
      return
    }

    setIsLoading(true)
    setIsModalOpen(true)

    try {
      // 이미지 분석: 식사구분 + 이미지 (음식 이름은 빈 문자열로 GPT가 인식)
      const result = await dietApiClient.analyzeFoodImage(file, mealType, '')
      setAnalysisResult(result)
      setImageUrl(previewUrl)
    } catch (error) {
      logger.error('Failed to analyze image:', error)
      alert('이미지 분석에 실패했습니다.')
      setIsModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextAnalysis = async () => {
    if (!foodName.trim()) {
      alert('음식 이름을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setIsModalOpen(true)

    try {
      // 텍스트 분석: 식사구분 + 음식 이름 (이미지 없음)
      const result = await dietApiClient.analyzeFoodImage(null, mealType, foodName)
      logger.debug('[MealInputForm] Analysis result received:', result)
      setAnalysisResult(result)
    } catch (error) {
      logger.error('Failed to analyze food:', error)
      alert('음식 분석에 실패했습니다.')
      setIsModalOpen(false)
    } finally {
      setIsLoading(false)
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
        <DietCamera ref={dietCameraRef} onImageCapture={handleImageCapture} />

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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
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
          onClose={() => setIsModalOpen(false)}
          analysisResult={analysisResult}
          onSave={handleAnalysisSave}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}

export default MealInputForm

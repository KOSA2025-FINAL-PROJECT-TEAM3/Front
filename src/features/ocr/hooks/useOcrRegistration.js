import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ocrApiClient } from '@core/services/api/ocrApiClient'
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient'
import {
  fromOCRResponse,
  createDefaultIntakeTimes,
  toRegisterFromOCRRequest
} from '@/types/ocr.types'
import { ROUTE_PATHS } from '@core/config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

/**
 * OCR 스캔 및 약물 등록 커스텀 훅
 *
 * @returns {Object} 훅 반환값
 * @property {string} step - 현재 단계 ('select'|'camera'|'preview'|'analyzing'|'edit'|'registering')
 * @property {File|null} file - 선택된 파일
 * @property {string|null} previewUrl - 이미지 프리뷰 URL
 * @property {PrescriptionFormState} formState - 폼 상태
 * @property {boolean} isLoading - 로딩 중
 * @property {string|null} error - 에러 메시지
 *
 * @property {Function} setStep - 단계 변경
 * @property {Function} handleFileSelect - 파일 선택 핸들러
 * @property {Function} handleCameraCapture - 카메라 캡처 핸들러
 * @property {Function} startAnalysis - OCR 분석 시작
 * @property {Function} updateFormState - 폼 상태 업데이트
 * @property {Function} updateMedication - 개별 약물 업데이트
 * @property {Function} removeMedication - 약물 삭제
 * @property {Function} addMedication - 약물 추가
 * @property {Function} updateIntakeTime - 복용 시간 업데이트
 * @property {Function} addIntakeTime - 복용 시간 추가
 * @property {Function} removeIntakeTime - 복용 시간 삭제
 * @property {Function} handleRegister - 등록 실행
 * @property {Function} reset - 초기화
 */
export function useOcrRegistration() {
  const navigate = useNavigate()

  // === 상태 ===
  const [step, setStep] = useState('select')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 폼 상태 (이미지 2,3,4 참고)
  const [formState, setFormState] = useState({
    pharmacyName: '',
    hospitalName: null,
    startDate: new Date().toISOString().split('T')[0], // 오늘
    endDate: calculateEndDate(3), // 3일 후
    intakeTimes: createDefaultIntakeTimes(),
    medications: [],
    paymentAmount: null
  })

  // === 파일 선택 ===
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setStep('preview')
      setError(null)
    }
  }, [])

  // === 카메라 캡처 ===
  const handleCameraCapture = useCallback((capturedFile) => {
    setFile(capturedFile)
    setPreviewUrl(URL.createObjectURL(capturedFile))
    setStep('preview')
    setError(null)
  }, [])

  // === OCR 분석 ===
  const startAnalysis = useCallback(async () => {
    if (!file) return

    setStep('analyzing')
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await ocrApiClient.scan(formData)

      /**
       * 백엔드 응답 형식:
       * {
       *   success: boolean,
       *   data: {
       *     medications: OCRMedicationInfo[],
       *     confidence: number,
       *     rawText: string,
       *     ocrEngine: string,
       *     processingTime: number
       *   },
       *   message: string | null,
       *   timestamp: string
       * }
       */
      if (response.success && response.data?.medications?.length > 0) {
        const medications = fromOCRResponse(response.data.medications)

        // 일수 자동 계산 (첫 번째 약의 duration 기준)
        const durationDays = medications[0]?.durationDays || 3

        setFormState(prev => ({
          ...prev,
          medications,
          endDate: calculateEndDate(durationDays),
          // 횟수에 따라 시간 슬롯 활성화 조정
          intakeTimes: adjustIntakeTimes(
            prev.intakeTimes,
            medications[0]?.dailyFrequency || 5
          )
        }))

        setStep('edit')
      } else {
        throw new Error('약물 정보를 찾을 수 없습니다.')
      }
    } catch (err) {
      logger.error('OCR Error:', err)
      setError(err.message || '분석 중 오류가 발생했습니다.')
      setStep('select')
    } finally {
      setIsLoading(false)
    }
  }, [file])

  // === 폼 상태 업데이트 ===
  const updateFormState = useCallback((updates) => {
    setFormState(prev => ({ ...prev, ...updates }))
  }, [])

  // === 개별 약물 업데이트 ===
  const updateMedication = useCallback((medicationId, updates) => {
    setFormState(prev => ({
      ...prev,
      medications: prev.medications.map(med =>
        med.id === medicationId ? { ...med, ...updates } : med
      )
    }))
  }, [])

  // === 약물 삭제 ===
  const removeMedication = useCallback((medicationId) => {
    setFormState(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId)
    }))
  }, [])

  // === 약물 추가 ===
  const addMedication = useCallback(() => {
    const newMedication = {
      id: `med-${Date.now()}`,
      name: '',
      category: null,
      dosageAmount: 1,
      dailyFrequency: formState.intakeTimes.length,
      durationDays: calculateDurationFromDates(formState.startDate, formState.endDate),
      selectedTimes: formState.intakeTimes.map(() => true),
      imageUrl: null
    }

    setFormState(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }))
  }, [formState.intakeTimes, formState.startDate, formState.endDate])

  // === 복용 시간 업데이트 ===
  const updateIntakeTime = useCallback((index, updates) => {
    setFormState(prev => ({
      ...prev,
      intakeTimes: prev.intakeTimes.map((slot, i) =>
        i === index ? { ...slot, ...updates } : slot
      )
    }))
  }, [])

  // === 복용 시간 추가 ===
  const addIntakeTime = useCallback(() => {
    if (formState.intakeTimes.length >= 10) return // 최대 10개

    const newIndex = formState.intakeTimes.length
    const newSlot = {
      index: newIndex,
      time: '12:00',
      label: '오후 12:00',
      hasAlarm: true
    }

    setFormState(prev => ({
      ...prev,
      intakeTimes: [...prev.intakeTimes, newSlot],
      // 모든 약물에 새 시간 슬롯 추가
      medications: prev.medications.map(med => ({
        ...med,
        selectedTimes: [...med.selectedTimes, true]
      }))
    }))
  }, [formState.intakeTimes.length])

  // === 복용 시간 삭제 ===
  const removeIntakeTime = useCallback((indexToRemove) => {
    if (formState.intakeTimes.length <= 1) return // 최소 1개

    setFormState(prev => ({
      ...prev,
      intakeTimes: prev.intakeTimes
        .filter((_, i) => i !== indexToRemove)
        .map((slot, i) => ({ ...slot, index: i })),
      // 모든 약물에서 해당 시간 슬롯 제거
      medications: prev.medications.map(med => ({
        ...med,
        selectedTimes: med.selectedTimes.filter((_, i) => i !== indexToRemove)
      }))
    }))
  }, [formState.intakeTimes.length])

  // === 등록 실행 ===
  const handleRegister = useCallback(async () => {
    if (formState.medications.length === 0) {
      setError('등록할 약물이 없습니다.')
      return
    }

    // 유효성 검사
    const invalidMeds = formState.medications.filter(med => !med.name.trim())
    if (invalidMeds.length > 0) {
      setError('약물 이름을 모두 입력해주세요.')
      return
    }

    setStep('registering')
    setIsLoading(true)
    setError(null)

    try {
      // OCR 데이터를 처방전 등록 형식으로 변환
      const ocrData = toRegisterFromOCRRequest(formState)

      logger.debug('📤 OCR 등록 시작:', ocrData)

      // 백엔드 API 직접 호출
      const result = await prescriptionApiClient.createPrescription(ocrData)

      logger.debug('✅ OCR 등록 성공:', result)
      toast.success('처방전이 등록되었습니다')

      // 약 관리 페이지로 이동
      navigate(ROUTE_PATHS.medication, { replace: true })

    } catch (err) {
      logger.error('❌ OCR 등록 실패:', err)
      setError(err.message || '등록 중 오류가 발생했습니다.')
      toast.error('처방전 등록에 실패했습니다')
      setStep('edit') // 편집 화면으로 되돌림
    } finally {
      setIsLoading(false)
    }
  }, [formState, navigate])

  // === 초기화 ===
  const reset = useCallback(() => {
    setStep('select')
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    setFormState({
      pharmacyName: '',
      hospitalName: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: calculateEndDate(3),
      intakeTimes: createDefaultIntakeTimes(),
      medications: [],
      paymentAmount: null
    })
  }, [])

  return {
    // 상태
    step,
    file,
    previewUrl,
    formState,
    isLoading,
    error,

    // 액션
    setStep,
    handleFileSelect,
    handleCameraCapture,
    startAnalysis,
    updateFormState,
    updateMedication,
    removeMedication,
    addMedication,
    updateIntakeTime,
    addIntakeTime,
    removeIntakeTime,
    handleRegister,
    reset
  }
}

// === Helper Functions ===

function calculateEndDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days - 1)
  return date.toISOString().split('T')[0]
}

function calculateDurationFromDates(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

function adjustIntakeTimes(intakeTimes, frequency) {
  // 빈도에 맞게 시간 슬롯 활성화
  // frequency가 5보다 작으면 일부만 활성화
  return intakeTimes.map((slot, index) => ({
    ...slot,
    // 필요한 슬롯만 활성화 (앞에서부터)
    hasAlarm: index < frequency
  }))
}

export default useOcrRegistration

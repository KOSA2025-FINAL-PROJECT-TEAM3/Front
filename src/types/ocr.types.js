/**
 * OCR 관련 타입 정의 (JSDoc 기반)
 */

/**
 * OCR 스캔 결과로부터 추출된 약물 정보
 * @typedef {Object} OCRMedicationInfo
 * @property {string} name - 약품명
 * @property {string} dosage - 용량 (예: "500mg")
 * @property {string} frequency - 복용 빈도 (예: "1일 3회")
 * @property {string} duration - 복용 기간 (예: "7일")
 * @property {string|null} sideEffects - 부작용
 * @property {string|null} precautions - 주의사항
 * @property {string|null} interactions - 약물 상호작용
 */

/**
 * 편집 가능한 약물 정보 (프론트엔드 상태용)
 * @typedef {Object} EditableMedication
 * @property {string} id - 프론트 고유 ID (예: "med-1732521600000")
 * @property {string} name - 약품명
 * @property {string|null} category - 분류 (예: "제산제", "당뇨병용제")
 * @property {number} dosageAmount - 1회 복용량 (정 단위)
 * @property {number} dailyFrequency - 하루 복용 횟수
 * @property {number} durationDays - 복용 일수
 * @property {boolean[]} selectedTimes - 선택된 복용 시간 (5개 슬롯)
 * @property {string|null} imageUrl - 약 이미지 URL
 */

/**
 * 복용 시간 슬롯
 * @typedef {Object} IntakeTimeSlot
 * @property {number} index - 인덱스 (0-4)
 * @property {string} time - 시간 "HH:mm" 형식
 * @property {string} label - 레이블 (예: "오전 7:00")
 * @property {boolean} hasAlarm - 알림 설정 여부
 */

/**
 * 처방전 등록 폼 상태
 * @typedef {Object} PrescriptionFormState
 * @property {string} pharmacyName - 약국명
 * @property {string|null} hospitalName - 병원명
 * @property {string} startDate - 시작일 (YYYY-MM-DD)
 * @property {string} endDate - 종료일 (YYYY-MM-DD)
 * @property {IntakeTimeSlot[]} intakeTimes - 복용 시간 슬롯 (5개)
 * @property {EditableMedication[]} medications - 약물 목록
 * @property {number|null} paymentAmount - 수납 금액 (원)
 */

/**
 * 백엔드 RegisterFromOCRRequest 형식으로 변환
 * @param {PrescriptionFormState} formState
 * @returns {Object} - API 요청 페이로드
 */
export function toRegisterFromOCRRequest(formState) {
  // 활성화된 시간만 추출 (HH:mm:ss 형식)
  const intakeTimes = formState.intakeTimes.map(slot => slot.time + ':00')

  const medications = formState.medications.map(med => {
    // 선택된 시간 인덱스 추출
    const intakeTimeIndices = med.selectedTimes
      .map((selected, index) => selected ? index : -1)
      .filter(index => index !== -1)

    return {
      name: med.name,
      category: med.category,
      dosageAmount: med.dosageAmount,
      totalIntakes: med.dailyFrequency * med.durationDays,
      daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN', // 기본: 매일 (요일명 형식)
      intakeTimeIndices: intakeTimeIndices.length === intakeTimes.length
        ? null  // 전체 선택이면 null
        : intakeTimeIndices,
      notes: null,
      imageUrl: med.imageUrl || null
    }
  })

  return {
    pharmacyName: formState.pharmacyName || null,
    hospitalName: formState.hospitalName || null,
    startDate: formState.startDate,
    endDate: formState.endDate,
    intakeTimes,
    medications,
    paymentAmount: formState.paymentAmount || null
  }
}

/**
 * OCR 응답을 편집 가능한 형태로 변환
 * @param {OCRMedicationInfo[]} ocrMedications
 * @returns {EditableMedication[]}
 */
export function fromOCRResponse(ocrMedications) {
  return ocrMedications.map((med, index) => ({
    id: `med-${Date.now()}-${index}`,
    name: med.name || '',
    category: med.category || null, // 백엔드 OCR에서 직접 제공
    dosageAmount: parseDosageAmount(med.dosage),
    dailyFrequency: parseFrequency(med.frequency),
    durationDays: parseDuration(med.duration),
    selectedTimes: [true, true, true, true, true], // 기본: 전체 선택
    imageUrl: med.imageUrl || null
  }))
}

/**
 * 기본 복용 시간 슬롯 생성
 * @returns {IntakeTimeSlot[]}
 */
export function createDefaultIntakeTimes() {
  return [
    { index: 0, time: '07:00', label: '오전 7:00', hasAlarm: true },
    { index: 1, time: '09:00', label: '오전 9:00', hasAlarm: true },
    { index: 2, time: '12:00', label: '오후 12:00', hasAlarm: true },
    { index: 3, time: '18:00', label: '오후 6:00', hasAlarm: true },
    { index: 4, time: '22:00', label: '오후 10:00', hasAlarm: true },
  ]
}

// === Helper Functions ===

function parseDosageAmount(dosageStr) {
  if (!dosageStr) return 1
  const match = dosageStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseFrequency(frequencyStr) {
  if (!frequencyStr) return 3
  // "1일 3회" → 3
  const match = frequencyStr.match(/(\d+)\s*회/)
  return match ? parseInt(match[1], 10) : 3
}

function parseDuration(durationStr) {
  if (!durationStr) return 3
  // "7일" → 7
  const match = durationStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 3
}

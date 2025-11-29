import ApiClient from './ApiClient'
import { MOCK_MEDICATIONS } from '@/data/mockMedications'

class MedicationApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_MEDICATION_API_URL || 'http://localhost:8082',
      basePath: '/api/medications',
    })
  }

  list() {
    return this.get('/', undefined, {
      mockResponse: () => [...MOCK_MEDICATIONS],
    })
  }

  create(payload) {
    return this.post('/', payload, undefined, {
      mockResponse: () => ({
        id: `med-${Date.now()}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        ...payload,
      }),
    })
  }

  update(id, payload) {
    return this.patch(`/${id}`, payload, undefined, {
      mockResponse: () => ({
        id,
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    })
  }

  remove(id) {
    return this.delete(`/${id}`, undefined, {
      mockResponse: () => ({ success: true, id }),
    })
  }

  /**
   * OCR 결과 기반 약물 일괄 등록
   *
   * @param {Object} payload - 등록 요청 데이터
   * @param {string|null} payload.pharmacyName - 약국명 (선택)
   * @param {string|null} payload.hospitalName - 병원명 (선택)
   * @param {string} payload.startDate - 시작일 "2025-11-25" (ISO 날짜)
   * @param {string} payload.endDate - 종료일 "2025-11-27"
   * @param {string[]} payload.intakeTimes - 복용 시간 ["07:00", "09:00", "12:00", "18:00", "22:00"]
   * @param {Array<Object>} payload.medications - 약물 배열
   * @param {string} payload.medications[].name - 약품명 (예: "알마겔정")
   * @param {string|null} payload.medications[].category - 분류 (예: "제산제")
   * @param {number} payload.medications[].dosageAmount - 1회 복용량 (예: 1)
   * @param {number} payload.medications[].totalIntakes - 총 복용 횟수 (예: 6)
   * @param {string|null} payload.medications[].daysOfWeek - 복용 요일 "1,2,3,4,5,6,7" (null이면 매일)
   * @param {number[]|null} payload.medications[].intakeTimeIndices - 선택된 시간 인덱스 [0,1,2,3,4] (null이면 전체)
   * @param {string|null} payload.medications[].notes - 메모
   * @returns {Promise<Array>} - 등록된 약물 목록 (MedicationResponse[])
   */
  registerFromOCR(payload) {
    return this.post('/register-from-ocr', payload, undefined, {
      mockResponse: () => {
        // Mock 응답: 등록된 약물 배열 반환
        return payload.medications.map((med, index) => ({
          id: `med-ocr-${Date.now()}-${index}`,
          userId: 1,
          name: med.name,
          ingredient: med.category || '정보 없음',
          dosage: `${med.dosageAmount}정`,
          startDate: payload.startDate,
          endDate: payload.endDate,
          quantity: med.totalIntakes,
          remaining: med.totalIntakes,
          active: true,
          schedules: payload.intakeTimes.map((time, idx) => ({
            id: `schedule-${Date.now()}-${index}-${idx}`,
            medicationId: `med-ocr-${Date.now()}-${index}`,
            intakeTime: time,
            daysOfWeek: med.daysOfWeek || '1,2,3,4,5,6,7',
            alarmEnabled: true,
            createdAt: new Date().toISOString(),
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      },
    })
  }

  /**
   * 약품명 검색 (MFDS API)
   *
   * @param {string} itemName - 약품명
   * @param {number} numOfRows - 조회 개수 (기본 10)
   * @returns {Promise<Array>} - 약품 정보 목록
   */
  searchMedications(itemName, numOfRows = 10) {
    return this.get('/search', { itemName, numOfRows }, {
      mockResponse: () => [{
        itemName: itemName,
        entpName: '제약회사명',
        efcyQesitm: '효능효과 정보',
        useMethodQesitm: '용법용량 정보',
        atpnQesitm: '주의사항',
        isAiGenerated: false,
      }],
    })
  }

  /**
   * AI를 사용한 약품 검색
   *
   * @param {string} itemName - 약품명
   * @returns {Promise<Object>} - AI가 생성한 약품 정보
   */
  searchMedicationsWithAI(itemName) {
    return this.get('/search/ai', { itemName }, {
      mockResponse: () => ({
        itemName: itemName,
        entpName: 'AI 생성 정보',
        efcyQesitm: 'AI가 생성한 효능효과 정보',
        useMethodQesitm: 'AI가 생성한 용법용량 정보',
        atpnQesitm: 'AI가 생성한 주의사항',
        isAiGenerated: true,
        aiDisclaimer: '이 정보는 AI가 생성한 것으로 주의를 요합니다. 정확한 정보는 의사 또는 약사와 상담하세요.',
      }),
    })
  }
}

export const medicationApiClient = new MedicationApiClient()
export { MedicationApiClient }

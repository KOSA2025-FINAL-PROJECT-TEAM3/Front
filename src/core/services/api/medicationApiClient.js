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
   * Backend expects: RegisterFromOCRRequest
   * Backend returns: MedicationBatchRegistrationResponse {
   *   totalCount, successCount, failureCount,
   *   successNames[], failureNames[], savedMedications[]
   * }
   *
   * @param {Object} payload - 등록 요청 데이터
   * @param {Array<Object>} payload.medications - 약물 배열
   * @param {string} payload.medications[].name - 약품명
   * @param {string} payload.medications[].dosage - 복용량
   * @param {string} payload.medications[].frequency - 복용 빈도
   * @param {string} payload.medications[].duration - 복용 기간
   * @param {string} payload.medications[].timing - 복용 시점
   * @param {string} payload.medications[].imageUrl - 약 이미지 URL (MFDS API)
   * @returns {Promise<MedicationBatchRegistrationResponse>}
   */
  registerFromOCR(payload) {
    return this.post('/register-from-ocr', payload, {
      timeout: 30000, // 30 seconds for batch registration
    }, {
      mockResponse: () => {
        // Mock response matching backend MedicationBatchRegistrationResponse
        const successCount = payload.medications.length;
        const failureCount = 0;

        return {
          totalCount: payload.medications.length,
          successCount,
          failureCount,
          successNames: payload.medications.map(m => m.name),
          failureNames: [],
          savedMedications: payload.medications.map((med, index) => ({
            id: Date.now() + index,
            userId: 1,
            name: med.name,
            dosage: med.dosage,
            timing: med.timing,
            imageUrl: med.imageUrl,
            active: true,
            schedules: [
              {
                id: Date.now() + index + 1000,
                time: '07:00',
                daysOfWeek: '1,2,3,4,5,6,7',
                active: true,
                isTakenToday: false,
              },
            ],
            hasLogsToday: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
        };
      },
    });
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

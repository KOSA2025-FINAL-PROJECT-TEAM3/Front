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
}

export const medicationApiClient = new MedicationApiClient()
export { MedicationApiClient }

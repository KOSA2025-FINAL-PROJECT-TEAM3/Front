import ApiClient from './ApiClient'

class MedicationLogApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: import.meta.env.VITE_MEDICATION_API_URL || 'http://localhost:8082',
            basePath: '/api/medications/logs',
        })
    }

    /**
     * 복용 기록 생성
     * @param {Object} payload - 복용 기록 데이터
     * @param {number} payload.medicationId - 약 ID
     * @param {number} payload.medicationScheduleId - 스케줄 ID
     * @param {string} payload.scheduledTime - 예정 시간 (ISO 8601)
     * @param {boolean} payload.completed - 복용 완료 여부
     * @returns {Promise<Object>} 생성된 복용 기록
     */
    create(payload) {
        return this.post('/', payload)
    }

    /**
     * 내 복용 기록 목록 조회
     * @returns {Promise<Array>} 복용 기록 목록
     */
    list() {
        return this.get('/')
    }

    /**
     * 특정 날짜의 복용 기록 조회
     * @param {string} date - 날짜 (YYYY-MM-DD)
     * @returns {Promise<Array>} 복용 기록 목록
     */
    getByDate(date) {
        return this.get('/', { date })
    }
}

export const medicationLogApiClient = new MedicationLogApiClient()
export { MedicationLogApiClient }

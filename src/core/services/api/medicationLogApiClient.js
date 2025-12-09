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
   * 약 복용 완료 처리 (Batch 로그 생성 후 사용)
   *
   * @param {number} scheduleId - 스케줄 ID
   * @returns {Promise<Object>} - 업데이트된 복용 기록
   */
  completeMedication(scheduleId) {
    return this.patch(`/${scheduleId}/complete`)
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
    return this.get('/', { params: { date } })
  }

  /**
   * 날짜 범위의 복용 기록 조회
   * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
   * @returns {Promise<Array>} 복용 기록 목록
   */
  getByDateRange(startDate, endDate) {
    return this.get('/', { params: { startDate, endDate } })
  }

  /**
   * 복약 순응도 요약 조회
   * @param {number} days - 최근 며칠 (기본: 30)
   * @returns {Promise<Object>} 순응도 요약 데이터
   */
  getAdherenceSummary(days = 30) {
    return this.get('/adherence/summary', { params: { days } })
  }

  /**
   * 일별 복약 순응도 조회
   * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
   * @returns {Promise<Array>} 일별 순응도 데이터
   */
  getDailyAdherence(startDate, endDate) {
    return this.get('/adherence/daily', { params: { startDate, endDate } })
  }

  /**
   * 약물별 복약 순응도 조회
   * @param {number} medicationId - 약물 ID
   * @param {number} days - 최근 며칠 (기본: 30)
   * @returns {Promise<Object>} 약물별 순응도 데이터
   */
  getMedicationAdherence(medicationId, days = 30) {
    return this.get(`/adherence/medication/${medicationId}`, { params: { days } })
  }
}

export const medicationLogApiClient = new MedicationLogApiClient()
export { MedicationLogApiClient }
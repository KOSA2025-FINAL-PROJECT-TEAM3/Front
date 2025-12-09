import ApiClient from './ApiClient'

class MedicationApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_MEDICATION_API_URL || 'http://localhost:8082',
      basePath: '/api/medications',
    })
  }

  list() {
    return this.get('/')
  }

  create(payload) {
    return this.post('/', payload)
  }

  update(id, payload) {
    return this.patch(`/${id}`, payload)
  }

  remove(id) {
    return this.delete(`/${id}`)
  }

  /**
   * 약품명 검색 (MFDS API)
   *
   * @param {string} itemName - 약품명
   * @param {number} numOfRows - 조회 개수 (기본 10)
   * @returns {Promise<Array>} - 약품 정보 목록
   */
  searchMedications(itemName, numOfRows = 10) {
    return this.get('/search', { itemName, numOfRows })
  }

  /**
   * AI를 사용한 약품 검색
   *
   * @param {string} itemName - 약품명
   * @returns {Promise<Object>} - AI가 생성한 약품 정보
   */
  searchMedicationsWithAI(itemName) {
    return this.get('/search/ai', { itemName })
  }
}

export const medicationApiClient = new MedicationApiClient()
export { MedicationApiClient }
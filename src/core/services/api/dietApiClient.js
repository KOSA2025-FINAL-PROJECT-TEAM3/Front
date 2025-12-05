import ApiClient from './ApiClient'
import {
  MOCK_FOOD_CONFLICT,
  MOCK_ALTERNATIVES,
} from '@/data/mockFoodWarnings'

class DietApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_DIET_API_URL || 'http://localhost:8082',
      basePath: '/api/diet',
    })
  }

  getFoodWarnings() {
    return this.get('/warnings', undefined, {
      mockResponse: () => ({
        conflict: MOCK_FOOD_CONFLICT,
        alternatives: MOCK_ALTERNATIVES,
      }),
    })
  }

  // Get all diet logs
  async getDietLogs() {
    return this.get('/logs')
  }

  // Add a new diet log
  async addDietLog(payload) {
    return this.post('/logs', payload)
  }

  // Update a diet log
  async updateDietLog(logId, payload) {
    return this.patch(`/logs/${logId}`, payload)
  }

  // Delete a diet log
  async deleteDietLog(logId) {
    return this.delete(`/logs/${logId}`)
  }

  // New method to analyze food image
  async analyzeFoodImage(file, mealType, foodName) {
    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    }
    formData.append('mealType', mealType)
    formData.append('foodName', foodName)

    return this.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000,
    }, {
      mockResponse: () => ({
        foodName: foodName || 'Mock Food',
        calories: 500,
        mealType: mealType,
        overallLevel: 'GOOD',
        drugInteractions: [],
        diseaseInteractions: [],
        summary: '안전: 현재 복용 중인 약물 및 질병과 특별한 상호작용이 없습니다.',
      }),
    })
  }
}

export const dietApiClient = new DietApiClient()
export { DietApiClient }

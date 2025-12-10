import ApiClient from './ApiClient'

class DietApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_DIET_API_URL || 'http://localhost:8082',
      basePath: '/api/diet',
    })
  }

  getFoodWarnings() {
    return this.get('/warnings')
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
    })
  }
}

export const dietApiClient = new DietApiClient()
export { DietApiClient }
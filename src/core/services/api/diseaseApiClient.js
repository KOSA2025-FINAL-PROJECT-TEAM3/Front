import { ApiClient } from './ApiClient'
import { MOCK_DISEASES } from '@/data/mockDiseases'

const client = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
  basePath: '/api/disease',
})

export const diseaseApiClient = {
  async listMyDiseases() {
    return client.get('/me', undefined, {
      mockResponse: () => MOCK_DISEASES,
    })
  },

  async getRestrictions(diseaseId) {
    return client.get(`/restrictions/${diseaseId}`, undefined, {
      mockResponse: () =>
        MOCK_DISEASES.find((d) => d.id === diseaseId)?.restrictions || [],
    })
  },

  async getDiseaseDetail(diseaseId) {
    return client.get(`/${diseaseId}`, undefined, {
      mockResponse: () => MOCK_DISEASES.find((d) => d.id === diseaseId) || null,
    })
  },
}

export default diseaseApiClient

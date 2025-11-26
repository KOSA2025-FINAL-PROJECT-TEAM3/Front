import { ApiClient } from './ApiClient'
import { MOCK_DISEASES } from '@/data/mockDiseases'

const client = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  basePath: '/api/disease',
})

export const diseaseApiClient = {
  async listByUser(userId) {
    return client.get(`/user/${userId}`, undefined, {
      mockResponse: () => MOCK_DISEASES,
    })
  },

  async getDiseaseDetail(diseaseId) {
    return client.get(`/${diseaseId}`, undefined, {
      mockResponse: () => MOCK_DISEASES.find((d) => d.id === Number(diseaseId)) || null,
    })
  },

  async create(payload) {
    return client.post('', payload)
  },

  async update(diseaseId, payload) {
    return client.put(`/${diseaseId}`, payload)
  },

  async remove(diseaseId) {
    return client.delete(`/${diseaseId}`)
  },

  async getTrash(userId) {
    return client.get(`/user/${userId}/trash`, undefined, {
      mockResponse: () => [],
    })
  },

  async emptyTrash(userId) {
    return client.delete(`/user/${userId}/trash`)
  },

  async exportPdf(userId) {
    return client.get(`/user/${userId}/export/pdf`, { responseType: 'blob' })
  },
}

export default diseaseApiClient

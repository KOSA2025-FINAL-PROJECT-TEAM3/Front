import { ApiClient } from './ApiClient'
import envConfig from '@config/environment.config'

const client = new ApiClient({
  baseURL: envConfig.API_BASE_URL,
  basePath: '/api/disease',
})

export const diseaseApiClient = {
  async listByUser(userId) {
    return client.get(`/user/${userId}`)
  },

  async getDiseaseDetail(diseaseId) {
    return client.get(`/${diseaseId}`)
  },

  async create(payload) {
    const { userId, ...data } = payload
    const params = userId ? { userId } : undefined
    return client.post('', data, { params })
  },

  async update(diseaseId, payload) {
    return client.put(`/${diseaseId}`, payload)
  },

  async remove(diseaseId) {
    return client.delete(`/${diseaseId}`)
  },

  async restore(diseaseId) {
    return client.post(`/${diseaseId}/restore`)
  },

  async getTrash(userId) {
    return client.get(`/user/${userId}/trash`)
  },

  async emptyTrash(userId) {
    return client.delete(`/user/${userId}/trash`)
  },

  async exportPdf(userId, familyGroupId) {
    const params = familyGroupId ? { familyGroupId } : undefined
    return client.get(`/user/${userId}/export/pdf`, { params, responseType: 'blob' })
  },
}

export default diseaseApiClient

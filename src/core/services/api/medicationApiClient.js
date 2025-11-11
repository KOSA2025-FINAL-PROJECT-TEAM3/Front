import ApiClient from './ApiClient'
import { MOCK_MEDICATIONS } from '@/data/mockMedications'

class MedicationApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/medications' })
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
}

export const medicationApiClient = new MedicationApiClient()
export { MedicationApiClient }

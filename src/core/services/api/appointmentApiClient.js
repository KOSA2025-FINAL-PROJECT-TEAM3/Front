import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class AppointmentApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.APPOINTMENT_API_URL || envConfig.API_BASE_URL,
      basePath: '/api/appointments',
    })
  }

  list(params = {}) {
    return this.get('/', { params })
  }

  getById(id) {
    return this.get(`/${id}`)
  }

  create(payload) {
    return this.post('/', payload)
  }

  update(id, payload) {
    return this.put(`/${id}`, payload)
  }

  cancel(id) {
    return this.delete(`/${id}`)
  }

  complete(id) {
    return this.post(`/${id}/complete`)
  }

  calendar(params = {}) {
    return this.get('/calendar', { params })
  }

  family(groupId, params = {}) {
    return this.get(`/family/${groupId}`, { params })
  }
}

export const appointmentApiClient = new AppointmentApiClient()
export { AppointmentApiClient }


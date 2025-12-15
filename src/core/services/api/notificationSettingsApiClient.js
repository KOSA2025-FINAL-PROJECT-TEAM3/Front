import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class NotificationSettingsApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.API_BASE_URL,
      basePath: '/api/notifications/settings',
    })
  }

  getUserSettings() {
    return this.get('')
  }

  updateUserSettings(payload) {
    return this.put('', payload)
  }
}

export const notificationSettingsApiClient = new NotificationSettingsApiClient()
export { NotificationSettingsApiClient }

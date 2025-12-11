import ApiClient from './ApiClient'

class NotificationSettingsApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
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

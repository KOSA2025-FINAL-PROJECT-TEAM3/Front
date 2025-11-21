import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'
import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications'

class NotificationApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: envConfig.NOTIFICATION_API_URL || envConfig.API_BASE_URL, // Fallback
            basePath: '/api/notifications',
        })
    }

    list(userId) {
        return this.get('/', { userId }, {
            mockResponse: () => MOCK_NOTIFICATIONS,
        })
    }

    getDetail(id) {
        return this.get(`/${id}`, undefined, {
            mockResponse: () => MOCK_NOTIFICATIONS.find((n) => n.id === id) || null,
        })
    }

    markAsRead(id) {
        return this.patch(`/${id}/read`, undefined, undefined, {
            mockResponse: () => ({ success: true, id }),
        })
    }
}

export const notificationApiClient = new NotificationApiClient()
export { NotificationApiClient }

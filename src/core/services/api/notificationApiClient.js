import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class NotificationApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: envConfig.NOTIFICATION_API_URL || envConfig.API_BASE_URL, // Fallback
            basePath: '/api/notifications',
        })
        this.eventSource = null
    }

    list(userId) {
        return this.get('/', { userId })
    }

    getDetail(id) {
        return this.get(`/${id}`)
    }

    markAsRead(id) {
        return this.patch(`/${id}/read`)
    }

    /**
     * Subscribe to real-time notifications via Server-Sent Events (SSE)
     * @param {string} token - Authentication token for authorization
     * @param {Function} onMessage - Callback function when a message is received
     * @param {Function} onError - Callback function when an error occurs
     * @returns {EventSource} The EventSource instance for potential cleanup
     */
    subscribe(token, onMessage, onError) {
        if (!token) {
            throw new Error('Token is required for SSE subscription')
        }

        const base = this.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
        const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
        const url = `${normalizedBase}${this.basePath}/subscribe?token=${encodeURIComponent(token)}`

        // Close existing connection if any
        this.disconnect()

        // Create new EventSource connection
        this.eventSource = new EventSource(url)

        // Handle incoming messages
        this.eventSource.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage(data)
                }
            } catch (error) {
                console.error('Failed to parse SSE message:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        // Handle specific event types
        this.eventSource.addEventListener('medication.logged', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'medication.logged' })
                }
            } catch (error) {
                console.error('Failed to parse medication.logged event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        this.eventSource.addEventListener('medication.missed', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'medication.missed' })
                }
            } catch (error) {
                console.error('Failed to parse medication.missed event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        // invite.accepted 이벤트 리스너 추가
        this.eventSource.addEventListener('invite.accepted', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'invite.accepted' })
                }
            } catch (error) {
                console.error('Failed to parse invite.accepted event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        // Handle connection errors
        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error)
            if (this.eventSource.readyState === EventSource.CLOSED) {
                console.warn('SSE connection closed')
            }
            if (onError) {
                onError(error)
            }
        }

        return this.eventSource
    }

    /**
     * Disconnect from the SSE stream
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
        }
    }

    /**
     * Check if SSE connection is active
     * @returns {boolean}
     */
    isConnected() {
        return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
    }
}

export const notificationApiClient = new NotificationApiClient()
export { NotificationApiClient }

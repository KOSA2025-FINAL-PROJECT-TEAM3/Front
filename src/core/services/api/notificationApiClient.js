import logger from "@core/utils/logger"
import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'
import { NOTIFICATION_PAGINATION, STORAGE_KEYS } from '@config/constants'
import { isJwtExpiredOrNearExpiry, refreshAuthToken } from '@core/interceptors/authInterceptor'

class NotificationApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: envConfig.NOTIFICATION_API_URL || envConfig.API_BASE_URL, // Fallback
            basePath: '/api/notifications',
        })
        this.eventSource = null
        this.reconnectTimer = null
        this.reconnectAttempts = 0
        this.lastSubscribeArgs = null
    }

    /**
     * 알림 목록 조회 (페이지네이션)
     * @param {number} page - 페이지 번호 (0부터 시작)
     * @param {number} size - 페이지 크기
     * @returns {Promise<{content: Array, totalElements: number, totalPages: number, last: boolean}>}
     */
    list(page = 0, size = NOTIFICATION_PAGINATION.PAGE_SIZE) {
        return this.get('/', { params: { page, size } })
    }

    getUnreadCount() {
        return this.get('/unread-count')
    }

    markAsRead(id) {
        return this.patch(`/${id}/read`)
    }

    markAllAsRead() {
        return this.patch('/read-all')
    }

    deleteNotification(id) {
        return this.delete(`/${id}`)
    }

    deleteAll() {
        return this.delete('')
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
        this.reconnectAttempts = 0
        this.lastSubscribeArgs = { token, onMessage, onError }

        // Create new EventSource connection
        this.eventSource = new EventSource(url)
        this.eventSource.onopen = () => {
            this.reconnectAttempts = 0
        }

        // Handle incoming messages
        this.eventSource.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage(data)
                }
            } catch (error) {
                logger.error('Failed to parse SSE message:', error)
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
                logger.error('Failed to parse medication.logged event:', error)
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
                logger.error('Failed to parse medication.missed event:', error)
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
                logger.error('Failed to parse invite.accepted event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        this.eventSource.addEventListener('medication.missed.aggregated', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'medication.missed.aggregated' })
                }
            } catch (error) {
                console.error('Failed to parse medication.missed.aggregated event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        this.eventSource.addEventListener('diet.warning', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'diet.warning' })
                }
            } catch (error) {
                console.error('Failed to parse diet.warning event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        this.eventSource.addEventListener('diet.job.done', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'diet.job.done' })
                }
            } catch (error) {
                console.error('Failed to parse diet.job.done event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        this.eventSource.addEventListener('ocr.job.done', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'ocr.job.done' })
                }
            } catch (error) {
                console.error('Failed to parse ocr.job.done event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        // 채팅 업데이트 알림 추가
        this.eventSource.addEventListener('chat-update', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (onMessage) {
                    onMessage({ ...data, type: 'chat-update' })
                }
            } catch (error) {
                logger.error('Failed to parse chat-update event:', error)
                if (onError) {
                    onError(error)
                }
            }
        })

        // Handle connection errors
        this.eventSource.onerror = (error) => {
            logger.error('SSE connection error:', error)
            if (this.eventSource.readyState === EventSource.CLOSED) {
                logger.warn('SSE connection closed')
                this.scheduleReconnect()
            }
            if (onError) {
                onError(error)
            }
        }

        return this.eventSource
    }

    scheduleReconnect() {
        if (!this.lastSubscribeArgs) return
        if (this.reconnectTimer) return

        const { token, onMessage, onError } = this.lastSubscribeArgs
        const baseDelay = 1000
        const maxDelay = 30000
        const delay = Math.min(maxDelay, baseDelay * Math.pow(2, this.reconnectAttempts))
        this.reconnectAttempts += 1

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null
            try {
                let nextToken = token
                if (typeof window !== 'undefined') {
                    const storedToken = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
                    nextToken = storedToken || token
                }

                if (nextToken && isJwtExpiredOrNearExpiry(nextToken)) {
                    nextToken = await refreshAuthToken()
                }

                if (!nextToken) {
                    logger.warn('SSE reconnect halted: missing or expired token')
                    this.disconnect()
                    if (onError) {
                        onError(new Error('SSE reconnect halted: missing or expired token'))
                    }
                    return
                }

                this.subscribe(nextToken, onMessage, onError)
            } catch (e) {
                logger.error('SSE reconnect failed:', e)
                this.scheduleReconnect()
            }
        }, delay)
    }

    /**
     * Disconnect from the SSE stream
     */
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.lastSubscribeArgs = null
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

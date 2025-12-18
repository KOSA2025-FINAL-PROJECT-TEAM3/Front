import logger from "@core/utils/logger"
/**
 * Notification Store
 * - 알림 상태 관리
 * - 실시간 알림 추가 지원
 */

import { create } from 'zustand'
import { notificationApiClient } from '@core/services/api/notificationApiClient'

const normalizeTypeKey = (value) => String(value || '').toLowerCase().replace(/\./g, '_')

const isDietWarningType = (value) => normalizeTypeKey(value) === 'diet_warning'

const dayKeyFromDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const calculateUnreadCount = (notifications) => {
  const seen = new Set()
  return notifications.filter((n) => {
    const key = n.groupKey || n.id
    if (n.read || seen.has(key)) return false
    seen.add(key)
    return true
  }).length
}

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  dietJobs: {},
  ocrJobs: {},
  isOcrScanning: false, // OCR 분석 진행 중 여부
  isDietAnalyzing: false, // 식단 분석 진행 중 여부

  setOcrScanning: (isScanning) => set({ isOcrScanning: isScanning }),
  setDietAnalyzing: (isAnalyzing) => set({ isDietAnalyzing: isAnalyzing }),

  setDietJobResult: (payload) => {
    set((state) => ({
      dietJobs: {
        ...state.dietJobs,
        [payload.jobId]: payload,
      },
    }))
  },

  setOcrJobResult: (payload) => {
    set((state) => ({
      ocrJobs: {
        ...state.ocrJobs,
        [payload.jobId]: payload,
      },
    }))
  },

  // 알림 목록 가져오기
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const response = await notificationApiClient.list()
      if (response && Array.isArray(response)) {
        const notifications = response.map((n) => ({
          // 서버 필드 다양성 고려
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read || n.status === 'READ',
          createdAt: new Date(n.takenTime || n.createdAt),
          type: n.type,
          scheduledTime: n.scheduledTime || n.scheduleTime || n.scheduledAt,
          missedMedications: n.missedMedications || n.missedMedicationList || n.medications,
          missedCount:
            n.missedCount ??
            n.missedMedicationCount ??
            (Array.isArray(n.missedMedications) ? n.missedMedications.length : undefined),
          groupKey:
            n.groupKey ||
            ((n.scheduledTime || n.scheduleTime || n.scheduledAt) &&
            normalizeTypeKey(n.type).includes('missed')
              ? `${normalizeTypeKey(n.type)}-${n.scheduledTime || n.scheduleTime || n.scheduledAt}`
              : undefined),
        }))
          .map((n) => {
            const typeKey = normalizeTypeKey(n.type)
            if (!n.groupKey && isDietWarningType(typeKey)) {
              const dayKey = dayKeyFromDate(n.createdAt)
              return dayKey ? { ...n, groupKey: `${typeKey}-${dayKey}` } : n
            }
            return n
          })
        set({ notifications, unreadCount: calculateUnreadCount(notifications), loading: false })
      } else {
        set({ notifications: [], unreadCount: 0, loading: false })
      }
    } catch (error) {
      logger.error('Failed to fetch notifications:', error)
      set({ error, loading: false, notifications: [], unreadCount: 0 })
    }
  },

  // 실시간 알림 추가 (SSE에서 호출)
  addRealtimeNotification: (notification) => {
    set((state) => {
      const payload = notification.notification ? { ...notification, ...notification.notification } : notification
      const normalizedType = normalizeTypeKey(payload.type || notification.type)
      const scheduledTime = payload.scheduledTime || notification.scheduledTime
      const missedMedications = payload.missedMedications || notification.missedMedications
      const missedCount =
        payload.missedCount ??
        notification.missedCount ??
        (Array.isArray(missedMedications) ? missedMedications.length : undefined)
      const createdAt = new Date(payload.takenTime || payload.createdAt || new Date())
      const groupKey = (() => {
        if (payload.groupKey) return payload.groupKey
        if (scheduledTime && normalizedType.includes('missed')) return `${normalizedType}-${scheduledTime}`
        if (isDietWarningType(normalizedType)) {
          const dayKey = dayKeyFromDate(createdAt)
          return dayKey ? `${normalizedType}-${dayKey}` : undefined
        }
        return undefined
      })()
      const id = payload.id || notification.id || groupKey || `realtime-${Date.now()}`
      const dedupKey = `${normalizedType}-${payload.message || ''}`.trim()

      // 중복 방지: 같은 ID, 그룹 키, 동일 타입+메시지 조합이 있으면 추가하지 않음
      const isDuplicate = state.notifications.some(
        (n) =>
          n.id === id ||
          (groupKey && n.groupKey === groupKey) ||
          (dedupKey && `${(n.type || '').toLowerCase()}-${n.message || ''}`.trim() === dedupKey)
      )
      if (isDuplicate) {
        return state
      }

      const newNotification = {
        id,
        title: payload.title || payload.medicationName || '알림',
        message: payload.message,
        read: false,
        createdAt,
        type: payload.type || notification.type || 'notification',
        scheduledTime,
        missedMedications,
        missedCount,
        groupKey,
      }

      const newNotifications = [newNotification, ...state.notifications]

      return {
        notifications: newNotifications,
        unreadCount: calculateUnreadCount(newNotifications),
      }
    })
  },

  // 알림 읽음 처리
  markAsRead: (id) => {
    set((state) => {
      const target = state.notifications.find((t) => t.id === id)
      const targetGroup = target?.groupKey
      const newNotifications = state.notifications.map((n) =>
        n.id === id || (targetGroup && n.groupKey === targetGroup) ? { ...n, read: true } : n
      )
      return {
        notifications: newNotifications,
        unreadCount: calculateUnreadCount(newNotifications),
      }
    })
    // API 호출 (비동기, 에러 무시)
    notificationApiClient.markAsRead(id).catch((error) => {
      logger.warn('Failed to mark notification as read:', error)
    })
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    const snapshot = []
    set((state) => {
      snapshot.push(state.notifications)
      const newNotifications = state.notifications.map((n) => ({ ...n, read: true }))
      return {
        notifications: newNotifications,
        unreadCount: 0,
      }
    })

    try {
      await notificationApiClient.markAllAsRead()
    } catch (error) {
      logger.warn('Failed to mark all notifications as read:', error)
      set((state) => {
        const prev = snapshot[0] || state.notifications
        return {
          notifications: prev,
          unreadCount: calculateUnreadCount(prev),
        }
      })
    }
  },

  // 알림 삭제
  removeNotification: (id) => {
    set((state) => {
      const target = state.notifications.find((t) => t.id === id)
      const targetGroup = target?.groupKey
      const newNotifications = state.notifications.filter((n) =>
        targetGroup ? n.id !== id && n.groupKey !== targetGroup : n.id !== id
      )
      return {
        notifications: newNotifications,
        unreadCount: calculateUnreadCount(newNotifications),
      }
    })
    // Call API to delete notification
    notificationApiClient.deleteNotification(id).catch((error) => {
      logger.warn('Failed to delete notification:', error)
      // Optional: rollback state if needed, but for now just log warning
    })
  },

  removeAllNotifications: async () => {
    const snapshot = []
    set((state) => {
      snapshot.push(state.notifications)
      return {
        notifications: [],
        unreadCount: 0,
      }
    })

    try {
      await notificationApiClient.deleteAll()
    } catch (error) {
      logger.warn('Failed to delete all notifications:', error)
      set((state) => {
        const prev = snapshot[0] || state.notifications
        return {
          notifications: prev,
          unreadCount: calculateUnreadCount(prev),
        }
      })
    }
  },
}))

export default useNotificationStore

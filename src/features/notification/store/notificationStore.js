/**
 * Notification Store
 * - 알림 상태 관리
 * - 실시간 알림 추가 지원
 */

import { create } from 'zustand'
import { notificationApiClient } from '@core/services/api/notificationApiClient'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  // 읽지 않은 알림 개수
  get unreadCount() {
    const seen = new Set()
    return get().notifications.filter((n) => {
      const key = n.groupKey || n.id
      if (n.read || seen.has(key)) return false
      seen.add(key)
      return true
    }).length
  },

  // 알림 목록 가져오기
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const response = await notificationApiClient.list()
      if (response && Array.isArray(response)) {
        const notifications = response.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read || n.status === 'READ',
          createdAt: new Date(n.createdAt),
          type: n.type,
        }))
        set({ notifications, loading: false })
      } else {
        set({ notifications: [], loading: false })
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ error, loading: false, notifications: [] })
    }
  },

  // 실시간 알림 추가 (SSE에서 호출)
  addRealtimeNotification: (notification) => {
    set((state) => {
      const payload = notification.notification ? { ...notification, ...notification.notification } : notification
      const normalizedType = (payload.type || notification.type || '').toLowerCase()
      const scheduledTime = payload.scheduledTime || notification.scheduledTime
      const missedMedications = payload.missedMedications || notification.missedMedications
      const missedCount =
        payload.missedCount ??
        notification.missedCount ??
        (Array.isArray(missedMedications) ? missedMedications.length : undefined)
      const groupKey =
        payload.groupKey ||
        (scheduledTime && normalizedType.includes('missed')
          ? `${normalizedType}-${scheduledTime}`
          : undefined)
      const id = payload.id || notification.id || groupKey || `realtime-${Date.now()}`

      // 중복 방지: 같은 ID 또는 동일 그룹 키가 이미 있으면 추가하지 않음
      const isDuplicate = state.notifications.some(
        (n) => n.id === id || (groupKey && n.groupKey === groupKey)
      )
      if (isDuplicate) {
        return state
      }

      const newNotification = {
        id,
        title: payload.title || payload.medicationName || '알림',
        message: payload.message,
        read: false,
        createdAt: new Date(payload.takenTime || payload.createdAt || new Date()),
        type: payload.type || notification.type || 'notification',
        scheduledTime,
        missedMedications,
        missedCount,
        groupKey,
      }

      return {
        notifications: [newNotification, ...state.notifications],
      }
    })
  },

  // 알림 읽음 처리
  markAsRead: (id) => {
    set((state) => {
      const target = state.notifications.find((t) => t.id === id)
      const targetGroup = target?.groupKey
      return {
        notifications: state.notifications.map((n) =>
          n.id === id || (targetGroup && n.groupKey === targetGroup) ? { ...n, read: true } : n
        ),
      }
    })
    // API 호출 (비동기, 에러 무시)
    notificationApiClient.markAsRead(id).catch((error) => {
      console.warn('Failed to mark notification as read:', error)
    })
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  // 알림 삭제
  removeNotification: (id) => {
    set((state) => {
      const target = state.notifications.find((t) => t.id === id)
      const targetGroup = target?.groupKey
      return {
        notifications: state.notifications.filter((n) =>
          targetGroup ? n.id !== id && n.groupKey !== targetGroup : n.id !== id
        ),
      }
    })
  },
}))

export default useNotificationStore

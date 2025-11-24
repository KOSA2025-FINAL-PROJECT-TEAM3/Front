/**
 * Notification Store
 * - 알림 상태 관리
 */

import { create } from 'zustand'
import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications'

// MOCK_NOTIFICATIONS를 store 형식으로 변환
const initialNotifications = MOCK_NOTIFICATIONS.map((n) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  read: n.status === 'READ',
  createdAt: new Date(n.createdAt),
}))

export const useNotificationStore = create((set, get) => ({
  notifications: initialNotifications,
  loading: false,
  error: null,

  // 읽지 않은 알림 개수
  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length
  },

  // 알림 목록 가져오기
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: API 호출
      // const notifications = await notificationApi.getAll()
      set({ notifications: initialNotifications, loading: false })
    } catch (error) {
      set({ error, loading: false })
    }
  },

  // 알림 읽음 처리
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  // 알림 삭제
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))

export default useNotificationStore

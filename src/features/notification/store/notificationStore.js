/**
 * Notification Store
 * - 알림 상태 관리
 */

import { create } from 'zustand'

// Mock 데이터 (추후 API 연동)
const mockNotifications = [
  { id: 1, title: '복약 알림', message: '아침 약 복용 시간입니다', read: false, createdAt: new Date() },
  { id: 2, title: '가족 알림', message: '어머니가 약을 복용했습니다', read: false, createdAt: new Date() },
  { id: 3, title: '식이 경고', message: '자몽 주스 섭취 주의', read: true, createdAt: new Date() },
]

export const useNotificationStore = create((set, get) => ({
  notifications: mockNotifications,
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
      set({ notifications: mockNotifications, loading: false })
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

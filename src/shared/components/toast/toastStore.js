/**
 * Toast Store
 * - Zustand 기반 토스트 알림 상태 관리
 */

import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = toastId++
    const newToast = {
      id,
      type: toast.type || 'info', // success, error, warning, info
      message: toast.message,
      duration: toast.duration || 3000,
      onClick: toast.onClick,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // 자동 제거
    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAll: () => {
    set({ toasts: [] })
  },
}))

// 간편 사용 함수들
const parseOptions = (options) => {
  if (typeof options === 'number') return { duration: options }
  return options || {}
}

export const toast = {
  success: (message, options) =>
    useToastStore.getState().addToast({ type: 'success', message, ...parseOptions(options) }),
  error: (message, options) =>
    useToastStore.getState().addToast({ type: 'error', message, ...parseOptions(options) }),
  warning: (message, options) =>
    useToastStore.getState().addToast({ type: 'warning', message, ...parseOptions(options) }),
  info: (message, options) =>
    useToastStore.getState().addToast({ type: 'info', message, ...parseOptions(options) }),
}

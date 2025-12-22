import { create } from 'zustand'

export const useFocusModeStore = create((set) => ({
  activeKeys: {},
  enterFocusMode: (key = 'default') =>
    set((state) => ({
      activeKeys: { ...state.activeKeys, [key]: true },
    })),
  exitFocusMode: (key = 'default') =>
    set((state) => {
      const next = { ...state.activeKeys }
      delete next[key]
      return { activeKeys: next }
    }),
}))


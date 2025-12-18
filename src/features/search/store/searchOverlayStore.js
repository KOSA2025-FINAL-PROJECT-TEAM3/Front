import { create } from 'zustand'

const normalizeTab = (value) => (value === 'pill' || value === 'diet' ? value : 'pill')

export const useSearchOverlayStore = create((set) => ({
  isOpen: false,
  activeTab: 'pill',
  openSeq: 0,

  open: (tab = 'pill') =>
    set((state) => ({
      isOpen: true,
      activeTab: normalizeTab(tab),
      openSeq: (state.openSeq || 0) + 1,
    })),

  close: () => set({ isOpen: false, activeTab: 'pill' }),

  setActiveTab: (tab) => set({ activeTab: normalizeTab(tab) }),
}))

export default useSearchOverlayStore

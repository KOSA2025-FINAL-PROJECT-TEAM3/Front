import { create } from 'zustand'

const normalizeTab = (value) => (value === 'pill' || value === 'diet' || value === 'disease' ? value : 'pill')

export const useSearchOverlayStore = create((set) => ({
  isOpen: false,
  activeTab: 'pill',
  openSeq: 0,
  // 대리 검색용 대상 사용자 정보
  targetUserId: null,
  targetUserName: null,

  open: (tab = 'pill', options = {}) =>
    set((state) => ({
      isOpen: true,
      activeTab: normalizeTab(tab),
      openSeq: (state.openSeq || 0) + 1,
      targetUserId: options.targetUserId || null,
      targetUserName: options.targetUserName || null,
    })),

  close: () => set({ isOpen: false, activeTab: 'pill', targetUserId: null, targetUserName: null }),

  setActiveTab: (tab) => set({ activeTab: normalizeTab(tab) }),
}))

export default useSearchOverlayStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'amapill-care-target-v1'

export const useCareTargetStore = create(
  persist(
    (set) => ({
      // FamilyMember.id (not userId)
      activeSeniorMemberId: null,
      setActiveSeniorMemberId: (memberId) => set({ activeSeniorMemberId: memberId != null ? String(memberId) : null }),
      clearActiveSeniorMemberId: () => set({ activeSeniorMemberId: null }),

      // 상태 초기화 (로그아웃 시 호출)
      reset: () => set({ activeSeniorMemberId: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        activeSeniorMemberId: state.activeSeniorMemberId,
      }),
    },
  ),
)

// 글로벌 로그아웃 이벤트 리스너 등록
if (typeof window !== 'undefined') {
  window.addEventListener('app:auth:logout', () => {
    useCareTargetStore.getState().reset()
  })
}

export default useCareTargetStore
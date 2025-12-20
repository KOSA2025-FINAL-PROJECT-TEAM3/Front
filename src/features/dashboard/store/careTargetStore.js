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
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        activeSeniorMemberId: state.activeSeniorMemberId,
      }),
    },
  ),
)

export default useCareTargetStore
import { create } from 'zustand';

export const useInviteStore = create((set) => ({
  inviteSession: null,
  
  setInviteSession: (session) => set({ inviteSession: session }),
  
  clearInviteSession: () => set({ inviteSession: null }),
  
  // 초대 링크로 온 경우 suggested role 가져오기
  getSuggestedRole: () => {
    const state = useInviteStore.getState();
    return state.inviteSession?.suggestedRole || null;
  }
}));

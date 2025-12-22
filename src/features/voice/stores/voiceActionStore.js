import { create } from 'zustand';

export const useVoiceActionStore = create((set, get) => ({
  pendingAction: null, // { code: 'AUTO_COMPLETE', params: {}, targetPath: '/medication/today' }

  // 명령 설정 (AI 응답 수신 시)
  setPendingAction: (action) => set({ pendingAction: action }),

  // 명령 소비 (페이지 진입 후 실행 시)
  consumeAction: (code) => {
    const current = get().pendingAction;
    if (current && current.code === code) {
      set({ pendingAction: null }); // 실행 후 초기화
      return current;
    }
    return null;
  },

  // 현재 대기 중인 명령 확인 (단순 조회)
  getPendingAction: () => get().pendingAction,
  
  // 강제 초기화
  clearAction: () => set({ pendingAction: null })
}));

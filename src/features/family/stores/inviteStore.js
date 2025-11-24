import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 초대 세션 스토어
 * - 초대 코드 입력 시 세션 정보 저장
 * - 로그인 후에도 세션 유지 (sessionStorage)
 */
export const useInviteStore = create(
  persist(
    (set, get) => ({
      inviteSession: null,

      /**
       * 초대 세션 설정
       * @param {Object} session - 초대 세션 정보
       * @param {string} session.inviteCode - 6자리 초대 코드
       * @param {string} session.groupName - 가족 그룹명
       * @param {string} session.inviterName - 초대한 사람 이름
       * @param {string} session.suggestedRole - 제안된 역할 (SENIOR/CAREGIVER)
       * @param {string} session.expiresAt - 만료 시간
       */
      setInviteSession: (session) => set({ inviteSession: session }),

      clearInviteSession: () => set({ inviteSession: null }),

      // 초대 링크로 온 경우 suggested role 가져오기
      getSuggestedRole: () => {
        const state = get();
        return state.inviteSession?.suggestedRole || null;
      },

      // 초대 코드 가져오기
      getInviteCode: () => {
        const state = get();
        return state.inviteSession?.inviteCode || null;
      },

      // 세션 유효성 확인
      isSessionValid: () => {
        const state = get();
        if (!state.inviteSession) return false;
        if (!state.inviteSession.expiresAt) return true;
        return new Date(state.inviteSession.expiresAt) > new Date();
      },
    }),
    {
      name: 'invite-session-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

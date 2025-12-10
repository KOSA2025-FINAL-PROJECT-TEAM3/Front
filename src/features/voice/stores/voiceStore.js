import { create } from 'zustand'

export const useVoiceStore = create((set) => ({
  isListening: false,
  transcript: '',
  feedbackMessage: '', // 사용자에게 보여줄 처리 결과 (예: "홈으로 이동합니다")
  
  setIsListening: (status) => set({ isListening: status }),
  setTranscript: (text) => set({ transcript: text }),
  setFeedbackMessage: (msg) => set({ feedbackMessage: msg }),
  
  reset: () => set({ isListening: false, transcript: '', feedbackMessage: '' }),
}))

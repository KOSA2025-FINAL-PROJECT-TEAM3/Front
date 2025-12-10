import ApiClient from './ApiClient'

class VoiceApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
      basePath: '/api/voice',
    })
  }

  /**
   * 음성 텍스트를 백엔드로 보내 의도를 파악하고 결과를 받습니다.
   * @param {string} text - 인식된 음성 텍스트
   * @returns {Promise<Object>} - { type, message, target, data }
   */
  processCommand(text) {
    return this.post('/process', { text }, undefined, {
      mockResponse: () => ({
        type: 'SPEAK',
        message: `[MOCK] 죄송해요, 서버 연결이 원활하지 않아요. "${text}"라고 하셨나요?`,
        target: null
      })
    })
  }
}

export const voiceApiClient = new VoiceApiClient()
export { VoiceApiClient }

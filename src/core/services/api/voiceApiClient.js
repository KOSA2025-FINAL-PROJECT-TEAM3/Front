import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class VoiceApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.API_BASE_URL,
      basePath: '/api/voice',
    })
  }

  /**
   * 음성 텍스트를 백엔드로 보내 의도를 파악하고 결과를 받습니다.
   * @param {string} text - 인식된 음성 텍스트
   * @param {string|number} targetUserId - 작업을 수행할 대상 사용자 ID
   * @returns {Promise<Object>} - { type, message, target, data }
   */
  processCommand(text, targetUserId = null) {
    return this.post('/process', { text, targetUserId }, undefined, {
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
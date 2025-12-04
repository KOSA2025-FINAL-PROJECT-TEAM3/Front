import ApiClient from './ApiClient'

class OcrApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
      basePath: '/api/ocr',
    })
  }

  scan(formData) {
    return this.post('/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 150000,  // 150초 (Google Vision 처리 시간 고려)
    })
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }

import ApiClient from './ApiClient'
import { createMockOcrResponse } from '@/data/mockOcr'

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
    }, {
      mockResponse: () => createMockOcrResponse(formData?.get('file')?.name),
    })
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }

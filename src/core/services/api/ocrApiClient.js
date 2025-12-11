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
      timeout: 300000,  // 300초 (Google Vision 처리 시간 고려)
    })
  }

  startScanJob(formData) {
    return this.post('/scan/jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    })
  }

  getScanJob(jobId) {
    return this.get(`/scan/jobs/${jobId}`)
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }

import ApiClient from './ApiClient'

class CounselApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
      basePath: '/api/counsel',
    })
  }

  submit(message) {
    const payload = { message }
    return this.post('/submit', payload)
  }
}

export const counselApiClient = new CounselApiClient()
export { CounselApiClient }
import ApiClient from './ApiClient'

class CounselApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
      basePath: '/api/counsel',
    })
  }

  submit(message) {
    const payload = { message }
    const mockResponse = () => ({ success: true, ticketId: `csl-${Date.now()}` })
    return this.post('/submit', payload, undefined, { mockResponse })
  }
}

export const counselApiClient = new CounselApiClient()
export { CounselApiClient }


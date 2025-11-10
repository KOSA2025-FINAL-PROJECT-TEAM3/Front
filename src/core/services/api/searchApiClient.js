import ApiClient from './ApiClient'
import { MOCK_SYMPTOMS } from '@/features/search/data/mockSymptoms'

class SearchApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/search' })
  }

  suggestSymptoms(query) {
    const q = (query || '').trim()
    const mockResponse = () => {
      if (!q) return []
      return MOCK_SYMPTOMS.filter((s) => s.includes(q)).slice(0, 10)
    }
    return this.get('/symptoms', undefined, { mockResponse })
  }
}

export const searchApiClient = new SearchApiClient()
export { SearchApiClient }


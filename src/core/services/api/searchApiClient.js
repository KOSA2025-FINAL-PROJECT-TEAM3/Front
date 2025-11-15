import ApiClient from './ApiClient'
import { MOCK_SYMPTOMS, MOCK_SYMPTOM_DETAILS } from '@/data/mockSymptoms'

class SearchApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8090',
      basePath: '/api/search',
    })
  }

  suggestSymptoms(query) {
    const q = (query || '').trim()
    const mockResponse = () => {
      if (!q) return []
      return MOCK_SYMPTOMS.filter((s) => s.includes(q)).slice(0, 10)
    }
    return this.get('/symptoms', undefined, { mockResponse })
  }

  getSymptomDetail(symptomName) {
    const name = (symptomName || '').trim()
    const mockResponse = () => {
      if (!name) return null
      return (
        MOCK_SYMPTOM_DETAILS[name] || {
          name,
          description: '등록된 상세 정보가 없습니다.',
          possibleCauses: [],
          severity: '정보 없음',
          recommendedActions: [],
        }
      )
    }
    return this.get(`/symptoms/${encodeURIComponent(name)}`, undefined, { mockResponse })
  }
}

export const searchApiClient = new SearchApiClient()
export { SearchApiClient }

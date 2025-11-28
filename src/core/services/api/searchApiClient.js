import ApiClient from './ApiClient'
import { MOCK_SYMPTOMS, MOCK_SYMPTOM_DETAILS } from '@/data/mockSymptoms'
import { MOCK_DRUG_SEARCH_RESULTS } from '@/data/mockDrugs'

const medicationSearchClient = new ApiClient({
  baseURL: import.meta.env.VITE_MEDICATION_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  basePath: '/api/medications',
})

class SearchApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8082',
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

  searchDrugs(itemName, options = {}) {
    const query = (itemName || '').trim()
    const numOfRows = Number(options?.numOfRows ?? 10) || 10
    const params = { itemName: query, numOfRows }
    const mockResponse = () => {
      if (!query) return []
      return MOCK_DRUG_SEARCH_RESULTS.slice(0, numOfRows)
    }
    return medicationSearchClient.get('/search', { params }, { mockResponse })
  }
}

export const searchApiClient = new SearchApiClient()
export { SearchApiClient }

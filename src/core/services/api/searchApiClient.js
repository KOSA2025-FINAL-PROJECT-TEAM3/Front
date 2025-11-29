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

  searchSymptomsWithAI(query) {
    const name = (query || '').trim()
    const mockResponse = () => ({
      name,
      description: `'${name}' 증상에 대한 AI 생성 요약입니다. 정확한 진단은 의료진과 상담하세요.`,
      possibleCauses: ['스트레스', '피로', '수면 부족'],
      recommendedActions: ['충분한 휴식', '수분 섭취', '증상 지속 시 진료 예약'],
      severity: '중간',
      aiGenerated: true,
      aiDisclaimer: 'AI가 생성한 정보로 참고용입니다. 의료진 상담을 우선하세요.',
    })
    return this.get('/symptoms/ai', { params: { query: name } }, { mockResponse })
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

  searchDrugsWithAI(itemName) {
    const query = (itemName || '').trim()
    const params = { itemName: query }
    const mockResponse = () => ({
      itemName: query,
      entpName: 'AI 생성 정보',
      efcyQesitm: 'AI가 생성한 효능효과 정보',
      useMethodQesitm: 'AI가 생성한 용법용량 정보',
      atpnQesitm: 'AI가 생성한 주의사항',
      isAiGenerated: true,
      aiDisclaimer: '이 정보는 AI가 생성한 것으로 주의를 요합니다. 정확한 정보는 의사 또는 약사와 상담하세요.',
    })
    return medicationSearchClient.get('/search/ai', { params }, { mockResponse })
  }
}

export const searchApiClient = new SearchApiClient()
export { SearchApiClient }

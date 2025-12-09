import ApiClient from './ApiClient'

const medicationSearchClient = new ApiClient({
  baseURL: import.meta.env.VITE_MEDICATION_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  basePath: '/api/medications',
})

class SearchApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_SEARCH_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:80',
      basePath: '/api/search',
    })
  }

  suggestSymptoms(query) {
    const q = (query || '').trim()
    return medicationSearchClient.get('/search/symptoms', { params: { query: q } })
  }

  getSymptomDetail(symptomName) {
    const name = (symptomName || '').trim()
    return medicationSearchClient.get(`/search/symptoms/${encodeURIComponent(name)}`)
  }

  searchSymptomsWithAI(query) {
    const name = (query || '').trim()
    return medicationSearchClient.get('/search/symptoms/ai', { params: { query: name } })
  }

  searchDrugs(itemName, options = {}) {
    const query = (itemName || '').trim()
    const numOfRows = Number(options?.numOfRows ?? 10) || 10
    const params = { itemName: query, numOfRows }
    return medicationSearchClient.get('/search', { params })
  }

  searchDrugsWithAI(itemName) {
    const query = (itemName || '').trim()
    const params = { itemName: query }
    return medicationSearchClient.get('/search/ai', { params })
  }
}

export const searchApiClient = new SearchApiClient()
export { SearchApiClient }
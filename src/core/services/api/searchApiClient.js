import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

const medicationSearchClient = new ApiClient({
  baseURL: envConfig.MEDICATION_API_URL || envConfig.API_BASE_URL,
  basePath: '/api/medications',
})

class SearchApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.SEARCH_API_URL || envConfig.API_BASE_URL,
      basePath: '/api/search',
    })
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

import ApiClient from './ApiClient'
import {
  MOCK_FOOD_CONFLICT,
  MOCK_ALTERNATIVES,
} from '@features/diet/data/mockFoodWarnings'

class DietApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/diet' })
  }

  getFoodWarnings() {
    return this.get('/warnings', undefined, {
      mockResponse: () => ({
        conflict: MOCK_FOOD_CONFLICT,
        alternatives: MOCK_ALTERNATIVES,
      }),
    })
  }
}

export const dietApiClient = new DietApiClient()
export { DietApiClient }

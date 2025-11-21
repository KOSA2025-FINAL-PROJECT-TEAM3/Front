import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'
import { MOCK_ADHERENCE_REPORT, MOCK_WEEKLY_STATS } from '@/data/mockReports'

class ReportApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: envConfig.REPORT_API_URL || envConfig.API_BASE_URL, // Fallback if REPORT_API_URL is not defined
            basePath: '/api/reports',
        })
    }

    getAdherenceReport(userId, startDate, endDate) {
        return this.post('/adherence', { userId, startDate, endDate }, undefined, {
            mockResponse: () => MOCK_ADHERENCE_REPORT,
        })
    }

    getWeeklyStats(userId) {
        return this.get('/weekly', { userId }, {
            mockResponse: () => MOCK_WEEKLY_STATS,
        })
    }
}

export const reportApiClient = new ReportApiClient()
export { ReportApiClient }

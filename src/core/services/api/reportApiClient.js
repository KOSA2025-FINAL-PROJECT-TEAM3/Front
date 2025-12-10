import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class ReportApiClient extends ApiClient {
    constructor() {
        super({
            baseURL: envConfig.REPORT_API_URL || envConfig.API_BASE_URL, // Fallback if REPORT_API_URL is not defined
            basePath: '/api/reports',
        })
    }

    getAdherenceReport(userId, startDate, endDate) {
        return this.post('/adherence', { userId, startDate, endDate })
    }

    getWeeklyStats(userId) {
        return this.get('/weekly', { userId })
    }
}

export const reportApiClient = new ReportApiClient()
export { ReportApiClient }
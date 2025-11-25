import ApiClient from './ApiClient'
import {
  MOCK_FOOD_CONFLICT,
  MOCK_ALTERNATIVES,
} from '@/data/mockFoodWarnings'
import { MOCK_DIET_LOGS } from '@/data/mockDiet'
import { STORAGE_KEYS } from '@config/constants'

const DIET_LOGS_STORAGE_KEY = STORAGE_KEYS.DIET_LOGS

const readDietLogs = () => {
  if (typeof window === 'undefined') {
    return [...MOCK_DIET_LOGS]
  }
  const stored = window.localStorage.getItem(DIET_LOGS_STORAGE_KEY)
  if (!stored) {
    return [...MOCK_DIET_LOGS]
  }
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : [...MOCK_DIET_LOGS]
  } catch (error) {
    console.warn('[DietApiClient] Failed to parse diet logs', error)
    return [...MOCK_DIET_LOGS]
  }
}

const persistDietLogs = (logs) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DIET_LOGS_STORAGE_KEY, JSON.stringify(logs))
}

class DietApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_DIET_API_URL || 'http://localhost:8082',
      basePath: '/api/diet',
    })
  }

  getFoodWarnings() {
    return this.get('/warnings', undefined, {
      mockResponse: () => ({
        conflict: MOCK_FOOD_CONFLICT,
        alternatives: MOCK_ALTERNATIVES,
      }),
    })
  }

  // New method to get diet logs
  async getDietLogs() {
    return this.get('/logs', undefined, {
      mockResponse: () => readDietLogs(),
    })
  }

  // New method to add a diet log
  async addDietLog(payload) {
    return this.post('/logs', payload, undefined, {
      mockResponse: () => {
        const currentLogs = readDietLogs()
        const newLog = {
          id: `diet-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...payload,
        }
        const updatedLogs = [...currentLogs, newLog]
        persistDietLogs(updatedLogs)
        return newLog
      },
    })
  }

  // New method to update a diet log
  async updateDietLog(logId, payload) {
    return this.patch(`/logs/${logId}`, payload, undefined, {
      mockResponse: () => {
        const currentLogs = readDietLogs()
        const logIndex = currentLogs.findIndex((log) => log.id === logId)
        if (logIndex === -1) {
          throw new Error('Log not found')
        }
        const updatedLog = { ...currentLogs[logIndex], ...payload }
        const updatedLogs = [...currentLogs]
        updatedLogs[logIndex] = updatedLog
        persistDietLogs(updatedLogs)
        return updatedLog
      },
    })
  }

  // New method to delete a diet log
  async deleteDietLog(logId) {
    return this.delete(`/logs/${logId}`, undefined, {
      mockResponse: () => {
        const currentLogs = readDietLogs()
        const updatedLogs = currentLogs.filter((log) => log.id !== logId)
        persistDietLogs(updatedLogs)
        return { success: true, id: logId }
      },
    })
  }
}

export const dietApiClient = new DietApiClient()
export { DietApiClient }

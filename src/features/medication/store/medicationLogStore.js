/**
 * Medication Log Store
 * - 복약 로그 데이터를 관리하고 캐싱하는 Store
 * - 중복 API 호출 방지 및 낙관적 업데이트 지원
 */

import { create } from 'zustand'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'
import logger from '@core/utils/logger'


const initialState = {
    logsByDate: {}, // { "2024-12-19": [Log, ...] }
    loadingStates: {}, // { "2024-12-19": boolean }
    errors: {},
}

export const useMedicationLogStore = create((set, get) => ({
    ...initialState,

    /**
     * 특정 날짜의 복약 로그 조회 (캐싱 지원)
     * @param {string} dateStr - YYYY-MM-DD
     * @param {boolean} force - 강제 새로고침 여부
     */
    fetchLogsByDate: async (dateStr, force = false) => {
        if (!dateStr) return []

        const state = get()

        // 이미 데이터가 있고 강제 로딩이 아니면 캐시 반환
        if (!force && state.logsByDate[dateStr] && !state.loadingStates[dateStr]) {
            return state.logsByDate[dateStr]
        }

        // 로딩 상태 설정
        set((prev) => ({
            loadingStates: { ...prev.loadingStates, [dateStr]: true },
            errors: { ...prev.errors, [dateStr]: null }
        }))

        try {
            const response = await medicationLogApiClient.getByDate(dateStr)
            const logs = response || []

            set((prev) => ({
                logsByDate: { ...prev.logsByDate, [dateStr]: logs },
                loadingStates: { ...prev.loadingStates, [dateStr]: false }
            }))

            return logs
        } catch (error) {
            logger.error(`[MedicationLogStore] fetchLogsByDate failed for ${dateStr}`, error)
            set((prev) => ({
                loadingStates: { ...prev.loadingStates, [dateStr]: false },
                errors: { ...prev.errors, [dateStr]: error }
            }))
            return []
        }
    },

    /**
     * 기간 조회 (단순 구현: 범위 내 모든 날짜를 개별 캐싱하지 않고, 범위 요청 후 날짜별로 쪼개서 저장)
     */
    fetchLogsByRange: async (startDateStr, endDateStr) => {
        try {
            const logs = await medicationLogApiClient.getByDateRange(startDateStr, endDateStr) || []

            // 조회된 로그를 날짜별로 그룹화하여 캐시에 병합
            const grouped = {}
            logs.forEach(log => {
                if (!log.scheduledTime) return
                const dateKey = log.scheduledTime.split('T')[0]
                if (!grouped[dateKey]) grouped[dateKey] = []
                grouped[dateKey].push(log)
            })

            set((prev) => ({
                logsByDate: { ...prev.logsByDate, ...grouped }
            }))

            return logs
        } catch (error) {
            logger.error(`[MedicationLogStore] fetchLogsByRange failed`, error)
            return []
        }
    },

    /**
     * 로그 업데이트 (낙관적 업데이트용)
     */
    updateLog: (updatedLog) => {
        if (!updatedLog?.scheduledTime) return

        const dateKey = updatedLog.scheduledTime.split('T')[0]
        set((prev) => {
            const currentLogs = prev.logsByDate[dateKey] || []
            const newLogs = currentLogs.map(log =>
                (log.id === updatedLog.id || log.medicationScheduleId === updatedLog.medicationScheduleId)
                    ? { ...log, ...updatedLog }
                    : log
            )
            return {
                logsByDate: { ...prev.logsByDate, [dateKey]: newLogs }
            }
        })
    },

    /**
     * 캐시 초기화 (로그아웃 등)
     */
    clearCache: () => set(initialState)
}))

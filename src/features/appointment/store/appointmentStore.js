import { create } from 'zustand'
import { appointmentApiClient } from '@core/services/api/appointmentApiClient'

const initialState = {
    appointments: [],
    currentAppointment: null,
    calendarDays: [],
    loading: false,
    error: null,
}

/**
 * 공통 로딩 래퍼 - 로딩/에러 상태 자동 관리
 */
const withLoading = async (set, fn) => {
    set({ loading: true, error: null })
    try {
        return await fn()
    } catch (error) {
        set({ error })
        throw error
    } finally {
        set({ loading: false })
    }
}

export const useAppointmentStore = create((set) => ({
    ...initialState,

    /**
     * 예약 목록 조회
     * @param {number} userId - 대상 사용자 ID (본인 또는 어르신)
     * @param {Object} params - { startDate, endDate, status }
     */
    fetchAppointments: async (userId, params = {}) =>
        withLoading(set, async () => {
            const list = await appointmentApiClient.list({ userId, ...params })
            set({ appointments: Array.isArray(list) ? list : [] })
            return list
        }),

    /**
     * 단일 예약 상세 조회
     * @param {number} id - 예약 ID
     */
    fetchAppointment: async (id) =>
        withLoading(set, async () => {
            const appointment = await appointmentApiClient.getById(id)
            set({ currentAppointment: appointment })
            return appointment
        }),

    /**
     * 예약 생성
     * @param {Object} payload - 예약 데이터
     */
    createAppointment: async (payload) =>
        withLoading(set, async () => {
            const newAppointment = await appointmentApiClient.create(payload)
            set((state) => ({
                appointments: [newAppointment, ...state.appointments],
            }))
            return newAppointment
        }),

    /**
     * 예약 수정
     * @param {number} id - 예약 ID
     * @param {Object} payload - 수정할 데이터
     */
    updateAppointment: async (id, payload) =>
        withLoading(set, async () => {
            const updated = await appointmentApiClient.update(id, payload)
            set((state) => ({
                appointments: state.appointments.map((app) =>
                    app.id === id ? { ...app, ...updated } : app
                ),
                currentAppointment:
                    state.currentAppointment?.id === id
                        ? { ...state.currentAppointment, ...updated }
                        : state.currentAppointment,
            }))
            return updated
        }),

    /**
     * 예약 취소 (Soft Delete)
     * @param {number} id - 예약 ID
     */
    cancelAppointment: async (id) =>
        withLoading(set, async () => {
            await appointmentApiClient.cancel(id)
            set((state) => ({
                appointments: state.appointments.map((app) =>
                    app.id === id ? { ...app, status: 'CANCELLED' } : app
                ),
                currentAppointment:
                    state.currentAppointment?.id === id
                        ? { ...state.currentAppointment, status: 'CANCELLED' }
                        : state.currentAppointment,
            }))
        }),

    /**
     * 방문 완료 처리
     * @param {number} id - 예약 ID
     */
    completeAppointment: async (id) =>
        withLoading(set, async () => {
            const completed = await appointmentApiClient.complete(id)
            set((state) => ({
                appointments: state.appointments.map((app) =>
                    app.id === id ? { ...app, ...completed, status: 'COMPLETED' } : app
                ),
                currentAppointment:
                    state.currentAppointment?.id === id
                        ? { ...state.currentAppointment, ...completed, status: 'COMPLETED' }
                        : state.currentAppointment,
            }))
            return completed
        }),

    /**
     * 월별 캘린더 데이터 조회
     * @param {number} userId - 대상 사용자 ID
     * @param {number} year - 연도
     * @param {number} month - 월 (1-12)
     */
    fetchCalendar: async (userId, year, month) =>
        withLoading(set, async () => {
            const days = await appointmentApiClient.calendar({ userId, year, month })
            set({ calendarDays: Array.isArray(days) ? days : [] })
            return days
        }),

    /**
     * 가족 예약 조회 (보호자용)
     * @param {number} groupId - 가족 그룹 ID
     * @param {number} year - 연도
     * @param {number} month - 월
     */
    fetchFamilyAppointments: async (groupId, year, month) =>
        withLoading(set, async () => {
            const list = await appointmentApiClient.family(groupId, { year, month })
            set({ appointments: Array.isArray(list) ? list : [] })
            return list
        }),

    /**
     * 현재 예약 초기화
     */
    clearCurrentAppointment: () => set({ currentAppointment: null }),

    /**
     * 전체 상태 초기화
     */
    reset: () => set(initialState),
}))

export default useAppointmentStore

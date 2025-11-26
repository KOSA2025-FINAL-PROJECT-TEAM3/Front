/**
 * Family Store
 * - 가족 그룹/멤버 상태를 Zustand로 관리
 */

import { create } from 'zustand'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { STORAGE_KEYS } from '@config/constants'

const initialState = {
  familyGroup: null,
  members: [],
  invites: { sent: [], received: [] },
  loading: false,
  error: null,
  initialized: false,
}

const normalizeInvites = (invites = {}) => ({
  sent: Array.isArray(invites.sent) ? invites.sent : Array.isArray(invites) ? invites : [],
  received: Array.isArray(invites.received) ? invites.received : [],
})

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

export const useFamilyStore = create((set, get) => ({
  ...initialState,
  _clearAuth: () => {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  initialize: async ({ force } = {}) => {
    // 1. 토큰 확인 - 없으면 초기화 스킵 (로그인 전)
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      return
    }

    // 2. 이미 초기화됐으면 스킵 (force true면 재초기화)
    if (get().initialized && !force) return

    // 3. 가족 데이터 로드
    await get().loadFamily()
  },

  loadFamily: async () =>
    withLoading(set, async () => {
      let summary = null
      let summaryError = null
      let inviteList = { sent: [], received: [] }

      // 1. [필수] 가족 요약 정보 (summary) 로드 및 안전한 오류 처리
      try {
        summary = await familyApiClient.getSummary()
        console.log('[familyStore] loadFamily - summary received:', summary)
        console.log('[familyStore] loadFamily - members array:', summary?.members)
      } catch (error) {
        const status = error?.response?.status
        if (status === 401) {
          get()._clearAuth()
          summaryError = null
        } else {
          summaryError = error
          console.warn('[familyStore] Failed to load family summary (unauthenticated or error):', error.message)
        }
      }

      // 2. [선택적] 초대 목록 (invites) 로드 (실패 허용)
      try {
        inviteList = await familyApiClient.getInvites()
      } catch (inviteError) {
        const status = inviteError?.response?.status
        if (status === 401) {
          get()._clearAuth()
          inviteList = { sent: [], received: [] }
        } else {
          console.warn('[familyStore] getInvites failed:', inviteError.message)
        }
      }

      const nextState = {
        familyGroup: summary?.group || null,
        members: summary?.members || [],
        invites: normalizeInvites(inviteList),
        error: summaryError ? summaryError : null,
        initialized: true,
      }
      console.log('[familyStore] loadFamily - setting state:', nextState)
      set(nextState)
    }),

  inviteMember: async (payload) =>
    withLoading(set, async () => {
      const state = get()
      const rawGroupId = state.familyGroup?.id

      console.log('[familyStore] inviteMember - familyGroup:', state.familyGroup)
      console.log('[familyStore] inviteMember - rawGroupId:', rawGroupId, 'type:', typeof rawGroupId)

      if (!rawGroupId) {
        throw new Error('가족 그룹이 없습니다. 먼저 가족 그룹을 생성해주세요.')
      }

      // groupId에서 숫자 추출 (예: "family-group-1" -> 1)
      let groupId
      if (typeof rawGroupId === 'number') {
        groupId = rawGroupId
      } else if (typeof rawGroupId === 'string') {
        // 문자열에서 마지막 숫자 부분 추출
        const match = rawGroupId.match(/(\d+)$/)
        if (match) {
          groupId = parseInt(match[1], 10)
        } else {
          // 전체를 숫자로 변환 시도
          groupId = parseInt(rawGroupId, 10)
        }
      }

      if (!groupId || isNaN(groupId)) {
        console.error('[familyStore] Cannot extract numeric groupId from:', rawGroupId)
        throw new Error(`유효하지 않은 그룹 ID입니다: ${rawGroupId}`)
      }

      const fullPayload = {
        ...payload,
        groupId,
        suggestedRole: payload.suggestedRole || payload.role,
      }

      console.log('[familyStore] inviteMember - fullPayload:', fullPayload)

      const res = await familyApiClient.inviteMember(fullPayload)
      set((state) => ({
        invites: {
          sent: res ? [res, ...(state.invites?.sent || [])] : state.invites?.sent || [],
          received: state.invites?.received || [],
        },
        error: null,
      }))
      return res
    }),

  removeMember: async (memberId) =>
    withLoading(set, async () => {
      await familyApiClient.removeMember(memberId)
      set((state) => ({
        members: state.members.filter((member) => member.id !== memberId),
        error: null,
      }))
    }),

  loadInvites: async () =>
    withLoading(set, async () => {
      const invites = await familyApiClient.getInvites()
      set((state) => ({
        invites: normalizeInvites(invites),
        error: null,
        initialized: state.initialized,
      }))
    }),

  cancelInvite: async (inviteId) =>
    withLoading(set, async () => {
      await familyApiClient.cancelInvite(inviteId)
      set((state) => ({
        invites: {
          sent: (state.invites?.sent || []).filter((invite) => invite.id !== inviteId),
          received: state.invites?.received || [],
        },
        error: null,
      }))
    }),

  acceptInvite: async (inviteCode) =>
    withLoading(set, async () => {
      return familyApiClient.acceptInvite(inviteCode)
    }),

  createFamilyGroup: async (name) =>
    withLoading(set, async () => {
      const group = await familyApiClient.createGroup(name)
      set({
        familyGroup: group,
        members: [],
        error: null,
      })
      return group
    }),

  refetchFamily: async () => get().loadFamily(),
}))

export default useFamilyStore

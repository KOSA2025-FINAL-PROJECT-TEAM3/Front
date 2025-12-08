/**
 * Family Store
 * - 가족 그룹/멤버 상태를 Zustand로 관리
 */

import { create } from 'zustand'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { STORAGE_KEYS } from '@config/constants'

const initialState = {
  familyGroups: [],         // 여러 그룹 지원
  selectedGroupId: null,    // 현재 선택된 그룹 ID
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
        // 현재 selectedGroupId가 있으면 유지, 없으면 첫 번째 그룹 사용
        const currentGroupId = get().selectedGroupId
        const targetGroupId = currentGroupId || summary?.groups?.[0]?.id || null
        inviteList = await familyApiClient.getInvites(targetGroupId)
      } catch (inviteError) {
        const status = inviteError?.response?.status
        if (status === 401) {
          get()._clearAuth()
          inviteList = { sent: [], received: [] }
        } else {
          console.warn('[familyStore] getInvites failed:', inviteError.message)
        }
      }

      // 현재 selectedGroupId가 있으면 유지, 없으면 첫 번째 그룹 자동 선택
      const currentGroupId = get().selectedGroupId
      const nextSelectedGroupId = currentGroupId || summary?.groups?.[0]?.id || null

      const nextState = {
        familyGroups: summary?.groups || [],
        selectedGroupId: nextSelectedGroupId,
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
      const rawGroupId = state.selectedGroupId

      console.log('[familyStore] inviteMember - selectedGroupId:', state.selectedGroupId)
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

      // 초대 생성 후 현재 그룹의 초대 목록 다시 로드
      try {
        const inviteList = await familyApiClient.getInvites(groupId)
        set((state) => ({
          invites: normalizeInvites(inviteList),
          error: null,
        }))
      } catch (e) {
        console.warn('[familyStore] inviteMember - failed to reload invites:', e.message)
      }

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
      const groupId = get().selectedGroupId
      const invites = await familyApiClient.getInvites(groupId)
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

  // SSE 이벤트용 헬퍼: 초대 ID로 보낸 초대 목록에서 제거
  removeInviteById: (inviteId) => {
    set((state) => ({
      invites: {
        sent: (state.invites?.sent || []).filter((inv) => inv.id !== inviteId),
        received: state.invites?.received || [],
      },
    }))
  },

  acceptInvite: async (inviteCode) =>
    withLoading(set, async () => {
      return familyApiClient.acceptInvite(inviteCode)
    }),

  createFamilyGroup: async (name) =>
    withLoading(set, async () => {
      const group = await familyApiClient.createGroup(name)
      set((state) => ({
        familyGroups: [...state.familyGroups, group],
        selectedGroupId: group.id,
        members: [],
        error: null,
      }))
      return group
    }),

  // 그룹 선택
  selectGroup: (groupId) => {
    set({ selectedGroupId: groupId })
  },

  // 선택된 그룹 가져오기
  getSelectedGroup: () => {
    const state = get()
    return state.familyGroups.find((g) => g.id === state.selectedGroupId) || null
  },

  refetchFamily: async () => get().loadFamily(),
}))

export default useFamilyStore

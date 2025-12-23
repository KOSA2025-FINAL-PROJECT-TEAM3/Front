/**
 * Family Store
 * - 가족 그룹/멤버 상태를 Zustand로 관리
 */

import { create } from 'zustand'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { STORAGE_KEYS } from '@config/constants'
import logger from '@core/utils/logger'
import { useAuthStore } from '@features/auth/store/authStore'

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

/**
 * Normalize a member object to ensure userId is available at the top level.
 * Backend may return userId nested as user.id - this flattens it for consistent access.
 */
const normalizeMember = (member) => {
  if (!member) return member
  return {
    ...member,
    // Flatten userId: prefer existing userId, fallback to user.id
    userId: member.userId ?? member.user?.id ?? null,
    // Flatten name if needed
    name: member.name ?? member.user?.name ?? null,
  }
}

/**
 * Normalize an array of members
 */
const normalizeMembers = (members) => {
  if (!Array.isArray(members)) return []
  return members.map(normalizeMember)
}

/**
 * Normalize a family group and its nested members
 */
const normalizeGroup = (group) => {
  if (!group) return group
  return {
    ...group,
    members: normalizeMembers(group.members),
  }
}

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
    useAuthStore.getState().clearAuthState()
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
        logger.api('familyStore', 'loadFamily - summary received:', summary)
        logger.api('familyStore', 'loadFamily - members array:', summary?.members)
      } catch (error) {
        const status = error?.response?.status
        if (status === 401) {
          get()._clearAuth()
          summaryError = null
        } else {
          summaryError = error
          logger.warn('familyStore', 'Failed to load family summary (unauthenticated or error):', error.message)
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
          logger.warn('familyStore', 'getInvites failed:', inviteError.message)
        }
      }

      // 현재 selectedGroupId가 유효하면 유지, 그렇지 않으면 첫 번째 그룹 자동 선택
      const currentGroupId = get().selectedGroupId
      const groups = summary?.groups || []
      // 삭제된 그룹 ID인 경우 무효화
      const isValidGroupId = groups.some(g => g.id === currentGroupId)
      const nextSelectedGroupId = isValidGroupId ? currentGroupId : (groups[0]?.id || null)

      const nextState = {
        // Normalize groups and members to ensure userId is available at top level
        familyGroups: (summary?.groups || []).map(normalizeGroup),
        selectedGroupId: nextSelectedGroupId,
        members: normalizeMembers(summary?.members || []),
        invites: normalizeInvites(inviteList),
        error: summaryError ? summaryError : null,
        initialized: true,
      }
      logger.api('familyStore', 'loadFamily - setting state:', nextState)
      set(nextState)
    }),

  inviteMember: async (payload) =>
    withLoading(set, async () => {
      const { selectedGroupId: rawGroupId } = get()

      logger.api('familyStore', 'inviteMember - selectedGroupId:', rawGroupId)
      logger.api('familyStore', 'inviteMember - rawGroupId:', rawGroupId, 'type:', typeof rawGroupId)

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
        logger.error('familyStore', 'Cannot extract numeric groupId from:', rawGroupId)
        throw new Error(`유효하지 않은 그룹 ID입니다: ${rawGroupId}`)
      }

      const fullPayload = {
        ...payload,
        groupId,
        suggestedRole: payload.suggestedRole || payload.role,
      }

      logger.api('familyStore', 'inviteMember - fullPayload:', fullPayload)

      const res = await familyApiClient.inviteMember(fullPayload)

      // 초대 생성 후 현재 그룹의 초대 목록 다시 로드
      try {
        const inviteList = await familyApiClient.getInvites(groupId)
        set({
          invites: normalizeInvites(inviteList),
          error: null,
        })
      } catch (e) {
        logger.warn('familyStore', 'inviteMember - failed to reload invites:', e.message)
      }

      return res
    }),

  removeMember: async (memberId) =>
    withLoading(set, async () => {
      await familyApiClient.removeMember(memberId)
      set((prev) => ({
        members: prev.members.filter((member) => String(member.id) !== String(memberId)),
        familyGroups: prev.familyGroups.map((group) => ({
          ...group,
          members: Array.isArray(group.members)
            ? group.members.filter((member) => String(member.id) !== String(memberId))
            : group.members,
        })),
        error: null,
      }))
    }),

  /**
   * 멤버 역할 변경
   * @param {string|number} memberId - 멤버 ID
   * @param {string} familyRole - 새 역할 (SENIOR or CAREGIVER)
   * @param {number|null} newOwnerMemberId - 소유자 위임 시 새 소유자 멤버 ID
   */
  updateMemberRole: async (memberId, familyRole, newOwnerMemberId = null) =>
    withLoading(set, async () => {
      await familyApiClient.updateMemberRole(memberId, familyRole, newOwnerMemberId)
      // 로컬 상태 업데이트
      set((prev) => ({
        members: prev.members.map((m) =>
          m.id === memberId || m.id === String(memberId)
            ? { ...m, role: familyRole }
            : m
        ),
        familyGroups: prev.familyGroups.map((g) => ({
          ...g,
          members: g.members?.map((m) =>
            m.id === memberId || m.id === String(memberId)
              ? { ...m, role: familyRole }
              : m
          ),
        })),
        error: null,
      }))
    }),

  loadInvites: async () =>
    withLoading(set, async () => {
      const groupId = get().selectedGroupId
      const invites = await familyApiClient.getInvites(groupId)
      set((prev) => ({
        invites: normalizeInvites(invites),
        error: null,
        initialized: prev.initialized,
      }))
    }),

  cancelInvite: async (inviteId) =>
    withLoading(set, async () => {
      await familyApiClient.cancelInvite(inviteId)
      set((prev) => ({
        invites: {
          sent: (prev.invites?.sent || []).filter((invite) => invite.id !== inviteId),
          received: prev.invites?.received || [],
        },
        error: null,
      }))
    }),

  // SSE 이벤트용 헬퍼: 초대 ID로 보낸 초대 목록에서 제거
  removeInviteById: (inviteId) => {
    set((prev) => ({
      invites: {
        sent: (prev.invites?.sent || []).filter((inv) => inv.id !== inviteId),
        received: prev.invites?.received || [],
      },
    }))
  },

  updateInvite: async (inviteId, payload) =>
    withLoading(set, async () => {
      await familyApiClient.updateInvite(inviteId, payload) // Assume API client has this
      set((prev) => ({
        invites: {
          sent: prev.invites.sent.map(inv => inv.id === inviteId ? { ...inv, ...payload } : inv),
          received: prev.invites.received.map(inv => inv.id === inviteId ? { ...inv, ...payload } : inv),
        },
        error: null,
      }))
    }),

  acceptInvite: async (payload) =>
    withLoading(set, async () => {
      return familyApiClient.acceptInvite(payload)
    }),

  createFamilyGroup: async (name) =>
    withLoading(set, async () => {
      const group = await familyApiClient.createGroup(name)
      set((prev) => ({
        familyGroups: [...prev.familyGroups, group],
        selectedGroupId: group.id,
        members: [],
        error: null,
      }))
      return group
    }),

  // 그룹 삭제 (해산)
  deleteGroup: async (groupId) =>
    withLoading(set, async () => {
      await familyApiClient.deleteGroup(groupId)
      const { selectedGroupId, familyGroups } = get()
      const remainingGroups = familyGroups.filter(g => g.id !== groupId)
      // 삭제된 그룹이 선택된 그룹이었으면 첫 번째 그룹으로 전환
      const nextSelectedGroupId = selectedGroupId === groupId
        ? (remainingGroups[0]?.id || null)
        : selectedGroupId
      set({
        familyGroups: remainingGroups,
        selectedGroupId: nextSelectedGroupId,
        // 삭제된 그룹의 멤버 정보도 클리어
        members: nextSelectedGroupId ? (remainingGroups.find(g => g.id === nextSelectedGroupId)?.members || []) : [],
        error: null,
      })
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

  reset: () => {
    set(initialState)
  },
}))

// 글로벌 로그아웃 이벤트 리스너 등록 (Store 외부에서 구독)
if (typeof window !== 'undefined') {
  window.addEventListener('app:auth:logout', () => {
    useFamilyStore.getState().reset()
  })
}

export default useFamilyStore

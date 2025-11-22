/**
 * Family Store
 * - 가족 그룹/멤버 상태를 Zustand로 관리
 */

import { create } from 'zustand'
import {
  DEFAULT_FAMILY_GROUP,
  DEFAULT_FAMILY_MEMBERS,
} from '@/data/mockFamily'
import { familyApiClient } from '@core/services/api/familyApiClient'

const initialState = {
  familyGroup: DEFAULT_FAMILY_GROUP,
  members: DEFAULT_FAMILY_MEMBERS,
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

  initialize: async ({ force } = {}) => {
    if (get().initialized && !force) return
    await get().loadFamily()
  },

  loadFamily: async () =>
    withLoading(set, async () => {
      const summary = await familyApiClient.getSummary()

      let inviteList = { sent: [], received: [] }
      try {
        inviteList = await familyApiClient.getInvites()
      } catch (inviteError) {
        console.warn('[familyStore] getInvites failed', inviteError)
      }

      set({
        familyGroup: summary?.group || DEFAULT_FAMILY_GROUP,
        members: summary?.members || DEFAULT_FAMILY_MEMBERS,
        invites: normalizeInvites(inviteList),
        error: null,
        initialized: true,
      })
    }),

  inviteMember: async (payload) =>
    withLoading(set, async () => {
      const res = await familyApiClient.inviteMember(payload)
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

  refetchFamily: async () => get().loadFamily(),
}))

export default useFamilyStore

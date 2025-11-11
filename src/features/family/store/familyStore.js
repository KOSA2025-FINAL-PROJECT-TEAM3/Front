/**
 * Family Store
 * - 媛議?洹몃９/硫ㅻ쾭 ?곹깭瑜?Zustand濡?愿由? */

import { create } from 'zustand'
import {
  DEFAULT_FAMILY_GROUP,
  DEFAULT_FAMILY_MEMBERS,
} from '@/data/mockFamily'
import { familyApiClient } from '@core/services/api/familyApiClient'

const initialState = {
  familyGroup: DEFAULT_FAMILY_GROUP,
  members: DEFAULT_FAMILY_MEMBERS,
  loading: false,
  error: null,
  initialized: false,
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

  initialize: async ({ force } = {}) => {
    if (get().initialized && !force) return
    await get().loadFamily()
  },

  loadFamily: async () =>
    withLoading(set, async () => {
      const data = await familyApiClient.getSummary()
      set({
        familyGroup: data?.group || DEFAULT_FAMILY_GROUP,
        members: data?.members || DEFAULT_FAMILY_MEMBERS,
        error: null,
        initialized: true,
      })
    }),

  inviteMember: async (payload) =>
    withLoading(set, async () => {
      const res = await familyApiClient.inviteMember(payload)
      const member = res?.member
      set((state) => ({
        members: [...state.members, member],
        error: null,
      }))
      return member
    }),

  removeMember: async (memberId) =>
    withLoading(set, async () => {
      await familyApiClient.removeMember(memberId)
      set((state) => ({
        members: state.members.filter((member) => member.id !== memberId),
        error: null,
      }))
    }),

  refetchFamily: async () => get().loadFamily(),
}))

export default useFamilyStore

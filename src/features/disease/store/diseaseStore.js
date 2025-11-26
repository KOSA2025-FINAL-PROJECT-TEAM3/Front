import { create } from 'zustand'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'

const initialState = {
  diseases: [],
  trash: [],
  loading: false,
  trashLoading: false,
  error: null,
  userId: null,
}

const withLoading = (set, key, fn) => async (...args) => {
  set({ [key]: true, error: null })
  try {
    return await fn(...args)
  } catch (error) {
    set({ error })
    throw error
  } finally {
    set({ [key]: false })
  }
}

export const useDiseaseStore = create((set, get) => ({
  ...initialState,

  setUserId: (userId) => set({ userId }),

  fetchDiseases: withLoading(set, 'loading', async (userIdParam) => {
    const userId = userIdParam ?? get().userId
    if (!userId) return []
    set({ userId })
    const list = await diseaseApiClient.listByUser(userId)
    set({ diseases: Array.isArray(list) ? list : [] })
    return list
  }),

  fetchTrash: withLoading(set, 'trashLoading', async (userIdParam) => {
    const userId = userIdParam ?? get().userId
    if (!userId) return []
    set({ userId })
    const list = await diseaseApiClient.getTrash(userId)
    set({ trash: Array.isArray(list) ? list : [] })
    return list
  }),

  createDisease: withLoading(set, 'loading', async (payload) => {
    const created = await diseaseApiClient.create(payload)
    set((state) => ({
      diseases: created ? [created, ...state.diseases] : state.diseases,
    }))
    return created
  }),

  updateDisease: withLoading(set, 'loading', async (diseaseId, payload) => {
    const updated = await diseaseApiClient.update(diseaseId, payload)
    set((state) => ({
      diseases: state.diseases.map((d) => (d.id === diseaseId ? { ...d, ...updated } : d)),
    }))
    return updated
  }),

  deleteDisease: withLoading(set, 'loading', async (diseaseId, userIdParam) => {
    const userId = userIdParam ?? get().userId
    await diseaseApiClient.remove(diseaseId)
    set((state) => ({
      diseases: state.diseases.filter((disease) => disease.id !== diseaseId),
    }))
    if (userId) {
      await get().fetchTrash(userId)
    }
  }),

  emptyTrash: withLoading(set, 'trashLoading', async (userIdParam) => {
    const userId = userIdParam ?? get().userId
    if (!userId) return
    await diseaseApiClient.emptyTrash(userId)
    set({ trash: [] })
  }),

  refreshAll: async () => {
    const userId = get().userId
    if (!userId) return
    await Promise.all([get().fetchDiseases(userId), get().fetchTrash(userId)])
  },
}))

export default useDiseaseStore

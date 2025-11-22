import { create } from 'zustand'
import { medicationApiClient } from '@core/services/api/medicationApiClient'

const initialState = {
  medications: [],
  loading: false,
  error: null,
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

export const useMedicationStore = create((set, get) => ({
  ...initialState,

  fetchMedications: async () =>
    withLoading(set, async () => {
      const list = await medicationApiClient.list()
      set({ medications: Array.isArray(list) ? list : [] })
    }),

  addMedication: async (payload) =>
    withLoading(set, async () => {
      const newMed = await medicationApiClient.create(payload)
      set((state) => ({
        medications: [newMed, ...state.medications],
      }))
      return newMed
    }),

  updateMedication: async (medId, patch) =>
    withLoading(set, async () => {
      const updated = await medicationApiClient.update(medId, patch)
      set((state) => ({
        medications: state.medications.map((med) =>
          med.id === medId ? { ...med, ...updated } : med,
        ),
      }))
    }),

  removeMedication: async (medId) =>
    withLoading(set, async () => {
      await medicationApiClient.remove(medId)
      set((state) => ({
        medications: state.medications.filter((med) => med.id !== medId),
      }))
    }),

  toggleStatus: async (medId) =>
    withLoading(set, async () => {
      const target = get().medications.find((med) => med.id === medId)
      if (!target) return

      // Toggle active status (boolean)
      const nextActive = !target.active
      const updated = await medicationApiClient.update(medId, { active: nextActive })

      // 로컬 상태 즉시 업데이트
      set((state) => ({
        medications: state.medications.map((med) =>
          med.id === medId ? { ...med, ...updated, active: nextActive } : med,
        ),
      }))
    }),
}))

export default useMedicationStore

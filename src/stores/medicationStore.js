import { create } from 'zustand'
import { MOCK_MEDICATIONS } from '@/features/medication/data/mockMedications'

const initialState = {
  medications: MOCK_MEDICATIONS,
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

  addMedication: async (payload) =>
    withLoading(set, async () => {
      const newMed = {
        id: `med-${Date.now()}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        ...payload,
      }
      set((state) => ({
        medications: [newMed, ...state.medications],
      }))
      return newMed
    }),

  updateMedication: async (medId, patch) =>
    withLoading(set, async () => {
      set((state) => ({
        medications: state.medications.map((med) =>
          med.id === medId
            ? { ...med, ...patch, updatedAt: new Date().toISOString() }
            : med,
        ),
      }))
    }),

  removeMedication: async (medId) =>
    withLoading(set, async () => {
      set((state) => ({
        medications: state.medications.filter((med) => med.id !== medId),
      }))
    }),

  toggleStatus: async (medId) =>
    withLoading(set, async () => {
      const target = get().medications.find((med) => med.id === medId)
      if (!target) return
      const nextStatus = target.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      set((state) => ({
        medications: state.medications.map((med) =>
          med.id === medId
            ? { ...med, status: nextStatus, updatedAt: new Date().toISOString() }
            : med,
        ),
      }))
    }),
}))

export default useMedicationStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'amapill-search-history-v1'

const normalizeMode = (mode) => (mode === 'pill' || mode === 'diet' || mode === 'symptom' ? mode : 'pill')

const normalizeTerm = (term) => String(term || '').trim()

const normalizeVariant = (variant) => (variant === 'ai' ? 'ai' : 'default')

const dedupeAndLimit = (items, limit = 10) => {
  const seen = new Set()
  const next = []
  for (const item of items) {
    const key = normalizeTerm(item?.term)
    if (!key || seen.has(key)) continue
    seen.add(key)
    next.push(item)
    if (next.length >= limit) break
  }
  return next
}

export const useSearchHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],
      pending: {
        pill: null, // { term, variant } | null
        diet: null, // { term, variant } | null
        symptom: null, // legacy: { term, variant } | null
      },

      record: (mode, term) =>
        set((state) => {
          const m = normalizeMode(mode)
          const t = normalizeTerm(term)
          if (!t) return state

          const entry = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, term: t, ts: Date.now() }
          const next = dedupeAndLimit([entry, ...(state.history || [])], 12)
          return {
            history: next,
          }
        }),

      clear: () => set({ history: [] }),
      clearAll: () => set({ history: [] }),

      requestSearch: (mode, term, variant = 'default') =>
        set((state) => ({
          pending: {
            ...state.pending,
            [normalizeMode(mode)]: normalizeTerm(term)
              ? { term: normalizeTerm(term), variant: normalizeVariant(variant) }
              : null,
          },
        })),

      consumeRequest: (mode) => {
        const m = normalizeMode(mode)
        const current = get().pending?.[m]
        if (!current) return null
        set((state) => ({
          pending: {
            ...state.pending,
            [m]: null,
          },
        }))
        return current
      },

      clearPending: () =>
        set(() => ({
          pending: {
            pill: null,
            diet: null,
            symptom: null,
          },
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
)

export default useSearchHistoryStore

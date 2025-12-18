import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

const STORAGE_KEY = 'amapill-ui-preferences-v1'

export const useUiPreferencesStore = create(
  persist(
    (set, get) => ({
      fontScaleLevel: 1, // 1: 표준(100%), 2: 크게(112.5%), 3: 더 크게(125%)
      hasSetFontScaleLevel: false,
      accessibilityMode: false,
      hasSetAccessibilityMode: false,

      setAccessibilityMode: (enabled) =>
        set((state) => {
          const nextEnabled = Boolean(enabled)
          const nextLevel = nextEnabled ? Math.max(state.fontScaleLevel, 2) : 1
          return {
            accessibilityMode: nextEnabled,
            hasSetAccessibilityMode: true,
            fontScaleLevel: nextLevel,
            hasSetFontScaleLevel: true,
          }
        }),

      setFontScaleLevel: (level) =>
        set(() => {
          const normalized = Math.max(1, Math.min(3, Number(level) || 1))
          return {
            fontScaleLevel: normalized,
            hasSetFontScaleLevel: true,
            accessibilityMode: normalized > 1,
            hasSetAccessibilityMode: true,
          }
        }),

      increaseFontScaleLevel: () => {
        const current = get().fontScaleLevel || 1
        get().setFontScaleLevel(current + 1)
      },

      decreaseFontScaleLevel: () => {
        const current = get().fontScaleLevel || 1
        get().setFontScaleLevel(current - 1)
      },

      toggleAccessibilityMode: () =>
        set((state) => {
          const nextLevel = state.accessibilityMode ? 1 : Math.max(state.fontScaleLevel, 2)
          return {
            accessibilityMode: !state.accessibilityMode,
            hasSetAccessibilityMode: true,
            fontScaleLevel: nextLevel,
            hasSetFontScaleLevel: true,
          }
        }),

      ensureDefaultForRole: (customerRole) => {
        if (get().hasSetFontScaleLevel || get().hasSetAccessibilityMode) return

        const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
        const defaultLevel = roleKey === USER_ROLES.SENIOR ? 3 : 1
        set({
          fontScaleLevel: defaultLevel,
          hasSetFontScaleLevel: true,
          accessibilityMode: defaultLevel > 1,
          hasSetAccessibilityMode: true,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        fontScaleLevel: state.fontScaleLevel,
        hasSetFontScaleLevel: state.hasSetFontScaleLevel,
        accessibilityMode: state.accessibilityMode,
        hasSetAccessibilityMode: state.hasSetAccessibilityMode,
      }),
    },
  ),
)

export default useUiPreferencesStore

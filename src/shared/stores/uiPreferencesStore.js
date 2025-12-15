import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

const STORAGE_KEY = 'amapill-ui-preferences-v1'

export const useUiPreferencesStore = create(
  persist(
    (set, get) => ({
      accessibilityMode: false,
      hasSetAccessibilityMode: false,

      setAccessibilityMode: (enabled) =>
        set({ accessibilityMode: Boolean(enabled), hasSetAccessibilityMode: true }),

      toggleAccessibilityMode: () =>
        set((state) => ({
          accessibilityMode: !state.accessibilityMode,
          hasSetAccessibilityMode: true,
        })),

      ensureDefaultForRole: (customerRole) => {
        if (get().hasSetAccessibilityMode) return

        const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
        set({
          accessibilityMode: roleKey === USER_ROLES.SENIOR,
          hasSetAccessibilityMode: true,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        accessibilityMode: state.accessibilityMode,
        hasSetAccessibilityMode: state.hasSetAccessibilityMode,
      }),
    },
  ),
)

export default useUiPreferencesStore


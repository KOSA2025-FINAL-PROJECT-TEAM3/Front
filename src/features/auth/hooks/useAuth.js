import { useAuthStore } from '@features/auth/store/authStore'

const defaultSelector = (state) => state

export const useAuth = (selector = defaultSelector) => {
  return useAuthStore(selector)
}

export default useAuth

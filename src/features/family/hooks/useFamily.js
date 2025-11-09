import { useFamilyStore } from '@/stores/familyStore'

const defaultSelector = (state) => state

export const useFamily = (selector = defaultSelector) => {
  return useFamilyStore(selector)
}

export default useFamily

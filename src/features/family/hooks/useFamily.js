import { useFamilyStore } from '@features/family/store/familyStore'

const defaultSelector = (state) => state

export const useFamily = (selector = defaultSelector) => {
  return useFamilyStore(selector)
}

export default useFamily

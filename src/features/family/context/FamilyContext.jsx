import { useEffect, useMemo } from 'react'
import { useFamilyStore } from '@features/family/store/familyStore'
import { FamilyContext } from './familyContextObject'
import { STORAGE_KEYS } from '@config/constants'

export const FamilyProvider = ({ children }) => {
  const initialize = useFamilyStore((state) => state.initialize)
  const isInitialized = useFamilyStore((state) => state.initialized)
  const group = useFamilyStore((state) => state.familyGroup)
  const members = useFamilyStore((state) => state.members)

  useEffect(() => {
    // 토큰이 있을 때만 초기화
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token && !isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  const value = useMemo(
    () => ({
      group,
      members,
    }),
    [group, members],
  )

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export default FamilyProvider

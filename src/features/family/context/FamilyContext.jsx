import { useEffect, useMemo } from 'react'
import { useFamilyStore } from '@features/family/store/familyStore'
import { FamilyContext } from './familyContextObject'

export const FamilyProvider = ({ children }) => {
  const initialize = useFamilyStore((state) => state.initialize)
  const isInitialized = useFamilyStore((state) => state.initialized)
  const group = useFamilyStore((state) => state.familyGroup)
  const members = useFamilyStore((state) => state.members)

  useEffect(() => {
    if (!isInitialized) {
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

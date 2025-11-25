import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useFamilyStore } from '@features/family/store/familyStore'
import { FamilyContext } from './familyContextObject'
import { STORAGE_KEYS } from '@config/constants'

export const FamilyProvider = ({ children }) => {
  const initialize = useFamilyStore((state) => state.initialize)
  const isInitialized = useFamilyStore((state) => state.initialized)
  const group = useFamilyStore((state) => state.familyGroup)
  const members = useFamilyStore((state) => state.members)
  const location = useLocation()

  const isTestPage =
    location.pathname.startsWith('/chat-test') || location.pathname.startsWith('/test-websocket')

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token && !isInitialized && !isTestPage) {
      initialize()
    }
  }, [initialize, isInitialized, isTestPage])

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

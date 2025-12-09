import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useFamilyStore } from '@features/family/store/familyStore'
import { FamilyContext } from './familyContextObject'
import { STORAGE_KEYS } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'

const PUBLIC_PATHS = new Set([
  ROUTE_PATHS.login,
  ROUTE_PATHS.signup,
  ROUTE_PATHS.kakaoCallback,
  ROUTE_PATHS.inviteCodeEntry,
  ROUTE_PATHS.inviteAccept,
  ROUTE_PATHS.privacyPolicy,
  ROUTE_PATHS.termsOfService,
  ROUTE_PATHS.root,
])

export const FamilyProvider = ({ children }) => {
  const initialize = useFamilyStore((state) => state.initialize)
  const isInitialized = useFamilyStore((state) => state.initialized)
  const group = useFamilyStore((state) => state.familyGroup)
  const members = useFamilyStore((state) => state.members)
  const location = useLocation()

  const isTestPage =
    location.pathname.startsWith('/chat-test') || location.pathname.startsWith('/test-websocket')

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.has(location.pathname)
    if (isPublic) return

    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token && !isInitialized && !isTestPage) {
      initialize()
    }
  }, [initialize, isInitialized, isTestPage, location.pathname])

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

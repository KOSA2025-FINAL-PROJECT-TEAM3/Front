import { ROUTE_PATHS } from '@config/routes.config'

export const shouldHideFloatingActions = ({ pathname = '', fullScreen = false, focusModeActive = false }) => {
  if (focusModeActive || fullScreen) return true

  const path = pathname || ''
  return (
    path.startsWith(ROUTE_PATHS.chatList) ||
    path.startsWith(ROUTE_PATHS.prescriptions) ||
    path.startsWith(ROUTE_PATHS.ocrScan) ||
    path.startsWith(ROUTE_PATHS.dietLog) ||
    path.startsWith(ROUTE_PATHS.disease) ||
    path.startsWith(ROUTE_PATHS.appointments) ||
    path.startsWith('/reports') ||
    path.startsWith(ROUTE_PATHS.settings)
  )
}

export default shouldHideFloatingActions

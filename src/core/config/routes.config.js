export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  signup: '/signup',
  kakaoCallback: '/auth/kakao/callback',
  roleSelection: '/role-selection',
  seniorDashboard: '/dashboard',
  guardianDashboard: '/guardian',
  medication: '/medication',
  search: '/search',
  counsel: '/counsel',
  disease: '/disease',
  dietWarning: '/diet/warning',
  ocrScan: '/ocr/scan',
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsNotifications: '/settings/notifications',
  family: '/family',
  familyInvite: '/family/invite',
  familyMemberDetail: '/family/member/:id',
}

export const ROUTE_META = {
  protected: [
    ROUTE_PATHS.roleSelection,
    ROUTE_PATHS.seniorDashboard,
    ROUTE_PATHS.guardianDashboard,
    ROUTE_PATHS.medication,
    ROUTE_PATHS.search,
    ROUTE_PATHS.counsel,
    ROUTE_PATHS.disease,
    ROUTE_PATHS.dietWarning,
    ROUTE_PATHS.ocrScan,
    ROUTE_PATHS.settings,
    ROUTE_PATHS.settingsProfile,
    ROUTE_PATHS.settingsNotifications,
    ROUTE_PATHS.family,
    ROUTE_PATHS.familyInvite,
  ],
}

export default ROUTE_PATHS

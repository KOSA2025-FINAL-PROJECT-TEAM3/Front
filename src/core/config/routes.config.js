export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  signup: '/signup',
  kakaoCallback: '/auth/kakao/callback',
  roleSelection: '/role-selection',
  seniorDashboard: '/dashboard',
  caregiverDashboard: '/caregiver',
  medication: '/medication',
  search: '/search',
  counsel: '/counsel',
  disease: '/disease',
  diseaseDetail: '/disease/:diseaseId', // New route
  dietWarning: '/diet/warning',
  dietLog: '/diet/log', // New route
  ocrScan: '/ocr/scan',
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsNotifications: '/settings/notifications',
  privacyPolicy: '/settings/privacy',
  termsOfService: '/settings/terms',
  family: '/family',
  familyInvite: '/family/invite',
  familyMemberDetail: '/family/member/:id',
  chatList: '/chat',
  chatConversation: '/chat/:roomId',
}

export const ROUTE_META = {
  protected: [
    ROUTE_PATHS.roleSelection,
    ROUTE_PATHS.seniorDashboard,
    ROUTE_PATHS.caregiverDashboard,
    ROUTE_PATHS.medication,
    ROUTE_PATHS.search,
    ROUTE_PATHS.counsel,
    ROUTE_PATHS.disease,
    ROUTE_PATHS.diseaseDetail, // Add to protected routes
    ROUTE_PATHS.dietWarning,
    ROUTE_PATHS.dietLog, // Add to protected routes
    ROUTE_PATHS.ocrScan,
    ROUTE_PATHS.settings,
    ROUTE_PATHS.settingsProfile,
    ROUTE_PATHS.settingsNotifications,
    ROUTE_PATHS.family,
    ROUTE_PATHS.familyInvite,
    ROUTE_PATHS.chatList,
    ROUTE_PATHS.chatConversation,
  ],
}

export default ROUTE_PATHS

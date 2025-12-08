export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  signup: '/signup',
  kakaoCallback: '/auth/kakao/callback',
  roleSelection: '/role-selection',
  seniorDashboard: '/dashboard',
  caregiverDashboard: '/caregiver',

  medication: '/medication',
  medicationToday: '/medication/today',
  medicationAdd: '/medication/add', // Deprecated - redirect to prescriptionAdd
  medicationEdit: '/medication/:id/edit',

  // Prescription (신규)
  prescriptions: '/prescriptions',
  prescriptionAdd: '/prescriptions/add',
  prescriptionDetail: '/prescriptions/:id',
  prescriptionEdit: '/prescriptions/:id/edit',

  search: '/search',
  pillSearch: '/pills/search',
  pillResult: '/pills/result',

  counsel: '/counsel',

  disease: '/disease',
  diseaseDetail: '/disease/:diseaseId',
  suspectedDisease: '/disease/suspected',
  diseaseRestrictions: '/disease/restrictions',

  dietWarning: '/diet/warning',
  dietLog: '/diet/log',

  ocrScan: '/ocr/scan',

  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsNotifications: '/settings/notifications',
  myMedicationsSettings: '/settings/medications',
  myDiseasesSettings: '/settings/diseases',
  privacyPolicy: '/settings/privacy',
  termsOfService: '/settings/terms',

  family: '/family',
  familyInvite: '/family/invites',
  familyMemberDetail: '/family/member/:id',

  inviteAccept: '/invites/start',
  inviteCodeEntry: '/invites/enter', // 초대 코드 수동 입력 페이지 (공개)

  chatList: '/chat',
  chatConversation: '/chat/:roomId',

  // ⭐ roomId 기반 라우트 (정답)
  familyChat: '/chat/family',
  familyChatConversation: '/chat/family/:roomId',
  familyChatByGroup: '/chat/family/group/:familyGroupId',

  notifications: '/notifications',
  notificationDetail: '/notifications/:id',

  adherenceReport: '/reports/adherence',
  weeklyStats: '/reports/weekly',

  more: '/more',
};

export const ROUTE_META = {
  protected: [
    ROUTE_PATHS.roleSelection,
    ROUTE_PATHS.seniorDashboard,
    ROUTE_PATHS.caregiverDashboard,

    ROUTE_PATHS.medication,
    ROUTE_PATHS.medicationToday,
    ROUTE_PATHS.medicationAdd,
    ROUTE_PATHS.medicationEdit,

    ROUTE_PATHS.search,
    ROUTE_PATHS.pillSearch,
    ROUTE_PATHS.pillResult,

    ROUTE_PATHS.counsel,

    ROUTE_PATHS.disease,
    ROUTE_PATHS.diseaseDetail,
    ROUTE_PATHS.suspectedDisease,
    ROUTE_PATHS.diseaseRestrictions,

    ROUTE_PATHS.dietWarning,
    ROUTE_PATHS.dietLog,

    ROUTE_PATHS.ocrScan,

    ROUTE_PATHS.settings,
    ROUTE_PATHS.settingsProfile,
    ROUTE_PATHS.settingsNotifications,
    ROUTE_PATHS.myMedicationsSettings,
    ROUTE_PATHS.myDiseasesSettings,

    ROUTE_PATHS.family,
    ROUTE_PATHS.familyInvite,
    ROUTE_PATHS.familyMemberDetail,

    ROUTE_PATHS.chatList,
    ROUTE_PATHS.chatConversation,
    ROUTE_PATHS.familyChatConversation,
    ROUTE_PATHS.familyChatByGroup,

    ROUTE_PATHS.notifications,
    ROUTE_PATHS.notificationDetail,

    ROUTE_PATHS.adherenceReport,
    ROUTE_PATHS.weeklyStats,

    ROUTE_PATHS.more,
  ],
};

export default ROUTE_PATHS;

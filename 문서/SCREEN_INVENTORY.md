# Screen Inventory (Front) — P0 기준

목적: P0 화면 목록/진행상태를 한눈에 관리하고, MUI 전환/정리 범위를 명확히 한다.

---

## Pages

| 영역 | Route | 파일 | 상태 |
| --- | --- | --- | --- |
| Auth | `/login` | `Front/src/features/auth/pages/Login.jsx` | MUI 전환 완료 |
| Auth | `/signup` | `Front/src/features/auth/pages/Signup.jsx` | MUI 전환 완료 |
| Auth | `/role-selection` | `Front/src/features/auth/pages/RoleSelection.jsx` | MUI 전환 완료 |
| Dashboard | `/dashboard` | `Front/src/features/dashboard/pages/SeniorDashboard.jsx` | MUI 전환 완료 |
| Dashboard | `/caregiver` | `Front/src/features/dashboard/pages/CaregiverDashboard.jsx` | MUI 전환 완료 |
| Medication | `/medication` | `Front/src/features/medication/pages/MedicationManagement.jsx` | MUI 전환 완료 |
| Medication | `/medication/today` | `Front/src/features/medication/pages/TodayMedications.jsx` | MUI 전환 완료 |
| Medication | `/prescriptions/add` | `Front/src/features/medication/pages/PrescriptionAddPage.jsx` | MUI 전환 완료 |
| Medication | `/prescriptions/:id` | `Front/src/features/medication/pages/PrescriptionDetailPage.jsx` | MUI 전환 완료 |
| Medication | `/medication/add` | `Front/src/features/medication/pages/MedicationAddPage.jsx` | MUI 전환 완료(Deprecated route) |
| Medication | `/medication/:id/edit` | `Front/src/features/medication/pages/MedicationEditPage.jsx` | MUI 전환 완료 |
| OCR | `/ocr/scan` | `Front/src/features/ocr/pages/PrescriptionScan.jsx` | MUI 전환 완료 |
| Diet | `/diet/log` | `Front/src/features/diet/pages/DietLogPage.jsx` | MUI 전환 완료 |
| Diet | `/diet/warning` | `Front/src/features/diet/pages/FoodWarning.jsx` | MUI 전환 완료 |
| Places | `/places` | `Front/src/features/places/pages/PlaceSearchPage.jsx` | Kakao Maps 연동 + AppShell/PageHeader 리듬 |
| Search | `/search` | `Front/src/features/search/pages/UnifiedSearchPage.jsx` | MUI 전환 완료 |
| Search | `/pills/search` | `Front/src/App.jsx` | `/search`로 리다이렉트(레거시 호환) |
| Search | `/pills/result` | `Front/src/features/search/pages/PillResultPage.jsx` | placeholder(MUI) |
| Disease | `/disease` | `Front/src/features/disease/pages/Disease.jsx` | MUI 전환 완료 |
| Disease | `/disease/:diseaseId` | `Front/src/features/disease/pages/DiseaseDetailPage.jsx` | MUI 전환 완료 |
| Disease | `/disease/suspected` | `Front/src/features/disease/pages/SuspectedDiseasePage.jsx` | placeholder(MUI) |
| Disease | `/disease/restrictions` | `Front/src/features/disease/pages/DiseaseRestrictionsPage.jsx` | placeholder(MUI) |
| Family | `/family` | `Front/src/features/family/pages/FamilyManagement.jsx` | MUI 전환 완료 |
| Family | `/family/invites` | `Front/src/features/family/pages/FamilyInvite.jsx` | MUI 전환 완료 |
| Family | `/family/member/:id` | `Front/src/features/family/pages/FamilyMemberDetail.jsx` | MUI 전환 완료 |
| Invite | `/invites/enter` | `Front/src/features/family/pages/InviteCodeEntry.jsx` | MUI 전환 완료 |
| Invite | `/invites/start` | `Front/src/App.jsx` | `/invites/enter`로 리다이렉트 |
| Chat | `/chat` | `Front/src/App.jsx` | `/chat/family`로 리다이렉트 |
| Chat | `/chat/:roomId` | `Front/src/features/chat/pages/ChatConversationPage.jsx` | MUI 전환 완료 |
| Chat | `/chat/family/:roomId` | `Front/src/features/chat/pages/FamilyChatConversationPage.jsx` | MUI 전환 완료 |
| Notification | `/notifications` | `Front/src/features/notification/pages/NotificationPage.jsx` | MUI 전환 완료 |
| Notification | `/notifications/:id` | `Front/src/features/notification/pages/NotificationDetailPage.jsx` | MUI 전환 완료 |
| Report | `/reports/adherence` | `Front/src/features/report/pages/AdherenceReportPage.jsx` | MUI 전환 완료 |
| Report | `/reports/weekly` | `Front/src/features/report/pages/WeeklyStatsPage.jsx` | MUI 전환 완료 |
| Settings | `/settings` | `Front/src/features/settings/pages/Settings.jsx` | MUI 전환 완료(1차) |
| Settings | `/settings/profile` | `Front/src/features/settings/pages/Profile/ProfileEdit.jsx` | MUI 전환 완료 |
| Settings | `/settings/notifications` | `Front/src/features/settings/pages/Notifications/NotificationSettings.jsx` | MUI 전환 완료 |
| Settings | `/settings/medications` | `Front/src/features/settings/pages/MyMedicationsSettingsPage.jsx` | placeholder(MUI) |
| Settings | `/settings/diseases` | `Front/src/features/settings/pages/MyDiseasesSettingsPage.jsx` | placeholder(MUI) |
| Settings | `/settings/privacy` | `Front/src/features/settings/pages/PrivacyPolicyPage.jsx` | 정리됨 |
| Settings | `/settings/terms` | `Front/src/features/settings/pages/TermsOfServicePage.jsx` | 정리됨 |
| More | `/more` | `Front/src/pages/more/MorePage.jsx` | MUI 전환 완료 |

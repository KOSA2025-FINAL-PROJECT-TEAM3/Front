# Refactoring Before Route Paths
Source commit: ec2628dedb6b78b608a31c21b6d2d1ebaddc8070

## ROUTE_PATHS (Front/src/core/config/routes.config.js)
| key | path |
| --- | --- |
| root | / |
| login | /login |
| signup | /signup |
| kakaoCallback | /auth/kakao/callback |
| deeplink | /deeplink |
| roleSelection | /role-selection |
| seniorDashboard | /dashboard |
| caregiverDashboard | /caregiver |
| medication | /medication |
| medicationToday | /medication/today |
| medicationAdd | /medication/add |
| medicationEdit | /medication/:id/edit |
| prescriptions | /prescriptions |
| prescriptionAdd | /prescriptions/add |
| prescriptionDetail | /prescriptions/:id |
| prescriptionEdit | /prescriptions/:id/edit |
| search | /search |
| pillSearch | /pills/search |
| pillResult | /pills/result |
| disease | /disease |
| diseaseDetail | /disease/:diseaseId |
| suspectedDisease | /disease/suspected |
| diseaseRestrictions | /disease/restrictions |
| dietWarning | /diet/warning |
| dietLog | /diet/log |
| ocrScan | /ocr/scan |
| settings | /settings |
| settingsProfile | /settings/profile |
| settingsNotifications | /settings/notifications |
| myMedicationsSettings | /settings/medications |
| myDiseasesSettings | /settings/diseases |
| privacyPolicy | /settings/privacy |
| termsOfService | /settings/terms |
| family | /family |
| familyInvite | /family/invites |
| familyMemberDetail | /family/member/:id |
| inviteAccept | /invites/start |
| inviteCodeEntry | /invites/enter |
| inviteLanding | /invites/enter |
| chatList | /chat |
| chatConversation | /chat/:roomId |
| familyChat | /chat/family |
| familyChatConversation | /chat/family/:roomId |
| familyChatByGroup | /chat/family/group/:familyGroupId |
| notifications | /notifications |
| notificationDetail | /notifications/:id |
| adherenceReport | /reports/adherence |
| weeklyStats | /reports/weekly |
| places | /places |
| more | /more |

## App Route Paths (Front/src/App.jsx)
- ROUTE_PATHS.login -> /login
- ROUTE_PATHS.signup -> /signup
- ROUTE_PATHS.kakaoCallback -> /auth/kakao/callback
- ROUTE_PATHS.deeplink -> /deeplink
- ROUTE_PATHS.privacyPolicy -> /settings/privacy
- ROUTE_PATHS.termsOfService -> /settings/terms
- ROUTE_PATHS.inviteCodeEntry -> /invites/enter
- ROUTE_PATHS.inviteAccept -> /invites/start
- ROUTE_PATHS.roleSelection -> /role-selection
- ROUTE_PATHS.seniorDashboard -> /dashboard
- ROUTE_PATHS.caregiverDashboard -> /caregiver
- ROUTE_PATHS.medication -> /medication
- ROUTE_PATHS.medicationToday -> /medication/today
- ROUTE_PATHS.prescriptionAdd -> /prescriptions/add
- ROUTE_PATHS.prescriptionDetail -> /prescriptions/:id
- ROUTE_PATHS.medicationAdd -> /medication/add
- ROUTE_PATHS.medicationEdit -> /medication/:id/edit
- ROUTE_PATHS.search -> /search
- ROUTE_PATHS.pillSearch -> /pills/search
- ROUTE_PATHS.pillResult -> /pills/result
- ROUTE_PATHS.disease -> /disease
- ROUTE_PATHS.diseaseDetail -> /disease/:diseaseId
- ROUTE_PATHS.suspectedDisease -> /disease/suspected
- ROUTE_PATHS.diseaseRestrictions -> /disease/restrictions
- ROUTE_PATHS.dietWarning -> /diet/warning
- ROUTE_PATHS.dietLog -> /diet/log
- ROUTE_PATHS.ocrScan -> /ocr/scan
- ROUTE_PATHS.settings -> /settings
- ROUTE_PATHS.settingsProfile -> /settings/profile
- ROUTE_PATHS.settingsNotifications -> /settings/notifications
- ROUTE_PATHS.myMedicationsSettings -> /settings/medications
- ROUTE_PATHS.myDiseasesSettings -> /settings/diseases
- ROUTE_PATHS.more -> /more
- ROUTE_PATHS.family -> /family
- ROUTE_PATHS.familyInvite -> /family/invites
- ROUTE_PATHS.familyMemberDetail -> /family/member/:id
- ROUTE_PATHS.chatList -> /chat
- ROUTE_PATHS.chatConversation -> /chat/:roomId
- ROUTE_PATHS.familyChat -> /chat/family
- ROUTE_PATHS.familyChatByGroup -> /chat/family/group/:familyGroupId
- ROUTE_PATHS.notifications -> /notifications
- ROUTE_PATHS.notificationDetail -> /notifications/:id
- ROUTE_PATHS.adherenceReport -> /reports/adherence
- ROUTE_PATHS.weeklyStats -> /reports/weekly
- ROUTE_PATHS.places -> /places
- ROUTE_PATHS.root -> /
- /invites/accept (literal)
- /medication/register (literal)
- /report/preview (literal)
- /disease/register (literal)

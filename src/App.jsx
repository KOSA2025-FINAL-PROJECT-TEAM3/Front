/**
 * App.jsx - 메인 라우팅 설정
 *
 * 라우팅 구조:
 * / → Login (로그인 페이지 + 개발자 뒷구멍)
 * /signup → Signup (회원가입)
 * /role-selection → RoleSelection (역할 선택) - PrivateRoute 보호
 * /dashboard → SeniorDashboard (시니어 대시보드) - PrivateRoute 보호
 * /caregiver → CaregiverDashboard (보호자 대시보드) - PrivateRoute 보호
 */

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import { FamilyProvider } from '@features/family/context/FamilyContext'
import { PrivateRoute } from './core/routing/PrivateRoute'
import { Login } from '@features/auth/pages/Login'
import { Signup } from '@features/auth/pages/Signup'
import { RoleSelection } from '@features/auth/pages/RoleSelection'
import { SeniorDashboard } from '@features/dashboard/pages/SeniorDashboard'
import { CaregiverDashboard } from '@features/dashboard/pages/CaregiverDashboard'
import KakaoCallbackPage from '@features/auth/pages/KakaoCallback'
import FamilyManagementPage from '@features/family/pages/FamilyManagement'
import FamilyInvitePage from '@features/family/pages/FamilyInvite'
import FamilyMemberDetailPage from '@features/family/pages/FamilyMemberDetail'
import InviteCodeEntryPage from '@features/family/pages/InviteCodeEntry'
import { InviteSignup } from '@features/family/pages/InviteSignup'
import FamilyJoin from '@features/family/pages/FamilyJoin'
import SettingsPage from '@features/settings/pages/Settings'
import ProfileEditPage from '@features/settings/pages/Profile/ProfileEdit'
import NotificationSettingsPage from '@features/settings/pages/Notifications/NotificationSettings'
import MyMedicationsSettingsPage from '@features/settings/pages/MyMedicationsSettingsPage'
import MyDiseasesSettingsPage from '@features/settings/pages/MyDiseasesSettingsPage'
import PrivacyPolicyPage from '@features/settings/pages/PrivacyPolicyPage'
import TermsOfServicePage from '@features/settings/pages/TermsOfServicePage'
import MedicationManagementPage from '@features/medication/pages/MedicationManagement'
import MedicationAddPage from '@features/medication/pages/MedicationAddPage'
import MedicationEditPage from '@features/medication/pages/MedicationEditPage'
import TodayMedications from '@features/medication/pages/TodayMedications'
import FoodWarningPage from '@features/diet/pages/FoodWarning'
import DietLogPage from '@features/diet/pages/DietLogPage'
import PrescriptionScanPage from '@features/ocr/pages/PrescriptionScan'
import UnifiedSearchPage from '@features/search/pages/UnifiedSearchPage'
import PillResultPage from '@features/search/pages/PillResultPage'
import DoctorCounselPage from '@features/counsel/pages/DoctorCounsel'
import DiseasePage from '@features/disease/pages/Disease'
import DiseaseDetailPage from '@features/disease/pages/DiseaseDetailPage'
import SuspectedDiseasePage from '@features/disease/pages/SuspectedDiseasePage'
import DiseaseRestrictionsPage from '@features/disease/pages/DiseaseRestrictionsPage'
import DoctorChatListPage from '@features/chat/pages/DoctorChatListPage'
import ChatConversationPage from '@features/chat/pages/ChatConversationPage'
import FamilyChatConversationPage from '@features/chat/pages/FamilyChatConversationPage'
import NotificationPage from '@features/notification/pages/NotificationPage'
import NotificationDetailPage from '@features/notification/pages/NotificationDetailPage'
import AdherenceReportPage from '@features/report/pages/AdherenceReportPage'
import WeeklyStatsPage from '@features/report/pages/WeeklyStatsPage'
import MorePage from '@pages/more/MorePage'
import DeveloperModePanel from '@devtools/DeveloperModePanel'
import ErrorBoundary from '@shared/components/ErrorBoundary'
import ErrorFallback from '@shared/components/ErrorFallback'
import ToastContainer from '@shared/components/toast/ToastContainer'
import { setNavigator } from '@core/routing/navigation'
import WsTestPage from '@pages/WsTestPage'

function NavigationRegistrar() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])
  return null
}

/**
 * 메인 App 컴포넌트
 * @returns {JSX.Element}
 */
function App() {

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <FamilyProvider>
          <NavigationRegistrar />
          <Routes>
            {/* 공개 페이지: 인증 불필요 */}
            <Route path={ROUTE_PATHS.login} element={<Login />} />
            <Route path={ROUTE_PATHS.signup} element={<Signup />} />
            <Route path={ROUTE_PATHS.kakaoCallback} element={<KakaoCallbackPage />} />
            <Route path={ROUTE_PATHS.privacyPolicy} element={<PrivacyPolicyPage />} />
            <Route path={ROUTE_PATHS.termsOfService} element={<TermsOfServicePage />} />

            {/* 초대 코드 입력 및 링크 진입 (공개) */}
            <Route path={ROUTE_PATHS.inviteCodeEntry} element={<InviteCodeEntryPage />} />
            <Route path={ROUTE_PATHS.inviteSignup} element={<InviteSignup />} />
            <Route path={ROUTE_PATHS.inviteAccept} element={<FamilyJoin />} />

            {/* 보호된 페이지: 인증 필요 */}
            <Route
              path={ROUTE_PATHS.roleSelection}
              element={<PrivateRoute element={<RoleSelection />} />}
            />
            <Route
              path={ROUTE_PATHS.seniorDashboard}
              element={<PrivateRoute element={<SeniorDashboard />} />}
            />
            <Route
              path={ROUTE_PATHS.caregiverDashboard}
              element={<PrivateRoute element={<CaregiverDashboard />} />}
            />

            {/* 약 관리 */}
            <Route
              path={ROUTE_PATHS.medication}
              element={<PrivateRoute element={<MedicationManagementPage />} />}
            />
            <Route
              path={ROUTE_PATHS.medicationToday}
              element={<PrivateRoute element={<TodayMedications />} />}
            />
            <Route
              path={ROUTE_PATHS.medicationAdd}
              element={<PrivateRoute element={<MedicationAddPage />} />}
            />
            <Route
              path={ROUTE_PATHS.medicationEdit}
              element={<PrivateRoute element={<MedicationEditPage />} />}
            />

            {/* 검색 */}
            <Route
              path={ROUTE_PATHS.search}
              element={<PrivateRoute element={<UnifiedSearchPage />} />}
            />
            <Route
              path={ROUTE_PATHS.pillSearch}
              element={<Navigate to={ROUTE_PATHS.search} replace />}
            />
            <Route
              path={ROUTE_PATHS.pillResult}
              element={<PrivateRoute element={<PillResultPage />} />}
            />

            {/* 질병 */}
            <Route
              path={ROUTE_PATHS.disease}
              element={<PrivateRoute element={<DiseasePage />} />}
            />
            <Route
              path={ROUTE_PATHS.diseaseDetail}
              element={<PrivateRoute element={<DiseaseDetailPage />} />}
            />
            <Route
              path={ROUTE_PATHS.suspectedDisease}
              element={<PrivateRoute element={<SuspectedDiseasePage />} />}
            />
            <Route
              path={ROUTE_PATHS.diseaseRestrictions}
              element={<PrivateRoute element={<DiseaseRestrictionsPage />} />}
            />

            {/* 식단 */}
            <Route
              path={ROUTE_PATHS.dietWarning}
              element={<PrivateRoute element={<FoodWarningPage />} />}
            />
            <Route
              path={ROUTE_PATHS.dietLog}
              element={<PrivateRoute element={<DietLogPage />} />}
            />

            {/* OCR */}
            <Route
              path={ROUTE_PATHS.ocrScan}
              element={<PrivateRoute element={<PrescriptionScanPage />} />}
            />

            {/* 상담 */}
            <Route
              path={ROUTE_PATHS.counsel}
              element={<PrivateRoute element={<DoctorCounselPage />} />}
            />

            {/* 설정 */}
            <Route
              path={ROUTE_PATHS.settings}
              element={<PrivateRoute element={<SettingsPage />} />}
            />
            <Route
              path={ROUTE_PATHS.settingsProfile}
              element={<PrivateRoute element={<ProfileEditPage />} />}
            />
            <Route
              path={ROUTE_PATHS.settingsNotifications}
              element={<PrivateRoute element={<NotificationSettingsPage />} />}
            />
            <Route
              path={ROUTE_PATHS.myMedicationsSettings}
              element={<PrivateRoute element={<MyMedicationsSettingsPage />} />}
            />
            <Route
              path={ROUTE_PATHS.myDiseasesSettings}
              element={<PrivateRoute element={<MyDiseasesSettingsPage />} />}
            />

            {/* 더보기 */}
            <Route
              path={ROUTE_PATHS.more}
              element={<PrivateRoute element={<MorePage />} />}
            />



            {/* 가족 */}
            <Route
              path={ROUTE_PATHS.family}
              element={<PrivateRoute element={<FamilyManagementPage />} />}
            />
            <Route
              path={ROUTE_PATHS.familyInvite}
              element={<PrivateRoute element={<FamilyInvitePage />} />}
            />
            <Route
              path={ROUTE_PATHS.familyMemberDetail}
              element={<PrivateRoute element={<FamilyMemberDetailPage />} />}
            />


            {/* 채팅 */}
            <Route
              path={ROUTE_PATHS.chatList}
              element={<PrivateRoute element={<DoctorChatListPage />} />}
            />
            <Route
              path={ROUTE_PATHS.chatConversation}
              element={<PrivateRoute element={<ChatConversationPage />} />}
            />

            <Route
              path={ROUTE_PATHS.familyChat}
              element={<PrivateRoute element={<FamilyChatConversationPage />} />}
            />

            <Route
              path={ROUTE_PATHS.familyChatByGroup}
              element={<PrivateRoute element={<FamilyChatConversationPage />} />}
            />

            {/* 알림 */}
            <Route
              path={ROUTE_PATHS.notifications}
              element={<PrivateRoute element={<NotificationPage />} />}
            />

            <Route
              path={ROUTE_PATHS.notificationDetail}
              element={<PrivateRoute element={<NotificationDetailPage />} />}
            />

            {/* 리포트 */}
            <Route
              path={ROUTE_PATHS.adherenceReport}
              element={<PrivateRoute element={<AdherenceReportPage />} />}
            />
            <Route
              path={ROUTE_PATHS.weeklyStats}
              element={<PrivateRoute element={<WeeklyStatsPage />} />}
            />

            <Route path="/ws-test" element={<WsTestPage />} />

            {/* 기본 경로: 로그인 페이지로 리다이렉트 */}
            <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.login} replace />} />

            {/* 404: 존재하지 않는 경로 */}
            <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
          </Routes>
          <ToastContainer />
          <DeveloperModePanel />
        </FamilyProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

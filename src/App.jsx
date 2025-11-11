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
import SettingsPage from '@features/settings/pages/Settings'
import ProfileEditPage from '@features/settings/pages/Profile/ProfileEdit'
import NotificationSettingsPage from '@features/settings/pages/Notifications/NotificationSettings'
import MedicationManagementPage from '@features/medication/pages/MedicationManagement'
import FoodWarningPage from '@features/diet/pages/FoodWarning'
import PrescriptionScanPage from '@features/ocr/pages/PrescriptionScan'
import SymptomSearchPage from '@features/search/pages/SymptomSearch'
import DoctorCounselPage from '@features/counsel/pages/DoctorCounsel'
import DiseasePage from '@features/disease/pages/Disease'
import DoctorChatListPage from '@features/chat/pages/DoctorChatListPage'
import ChatConversationPage from '@features/chat/pages/ChatConversationPage'
import DeveloperModePanel from '@devtools/DeveloperModePanel'
import { setNavigator } from '@core/routing/navigation'

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
    <BrowserRouter>
      <FamilyProvider>
        <NavigationRegistrar />
        <Routes>
            {/* 공개 페이지: 인증 불필요 */}
            <Route path={ROUTE_PATHS.login} element={<Login />} />
            <Route path={ROUTE_PATHS.signup} element={<Signup />} />
          <Route path={ROUTE_PATHS.kakaoCallback} element={<KakaoCallbackPage />} />

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

          {/* 메뉴바의 다른 페이지들 (스텁) - PrivateRoute 보호 */}
          <Route
            path={ROUTE_PATHS.medication}
            element={<PrivateRoute element={<MedicationManagementPage />} />}
          />
          <Route
            path={ROUTE_PATHS.search}
            element={<PrivateRoute element={<SymptomSearchPage />} />}
          />
          <Route
            path={ROUTE_PATHS.counsel}
            element={<PrivateRoute element={<DoctorCounselPage />} />}
          />
          <Route
            path={ROUTE_PATHS.disease}
            element={<PrivateRoute element={<DiseasePage />} />}
          />
          <Route
            path={ROUTE_PATHS.dietWarning}
            element={<PrivateRoute element={<FoodWarningPage />} />}
          />
          <Route
            path={ROUTE_PATHS.ocrScan}
            element={<PrivateRoute element={<PrescriptionScanPage />} />}
          />
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
          <Route
            path={ROUTE_PATHS.chatList}
            element={<PrivateRoute element={<DoctorChatListPage />} />}
          />
          <Route
            path={ROUTE_PATHS.chatConversation}
            element={<PrivateRoute element={<ChatConversationPage />} />}
          />

          {/* 기본 경로: 로그인 페이지로 리다이렉트 */}
          <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.login} replace />} />

          {/* 404: 존재하지 않는 경로 */}
          <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
        </Routes>
        <DeveloperModePanel />
      </FamilyProvider>
    </BrowserRouter>
  )
}

export default App

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

import React, { Suspense, useEffect, lazy } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/styles/theme'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuth } from '@features/auth/hooks/useAuth'
import { FamilyProvider } from '@features/family/context/FamilyContext'
import { PrivateRoute } from './core/routing/PrivateRoute'
import LoadingSpinner from '@shared/components/LoadingSpinner'
import envConfig from '@config/environment.config'

// Lazy-loaded page components
const Login = lazy(() => import('@features/auth/pages/Login'))
const Signup = lazy(() => import('@features/auth/pages/Signup'))
const RoleSelection = lazy(() => import('@features/auth/pages/RoleSelection'))
const DeepLinkResolverPage = lazy(() => import('@features/auth/pages/DeepLinkResolver'))
const SeniorDashboard = lazy(() => import('@features/dashboard/pages/SeniorDashboard'))
const CaregiverDashboard = lazy(() => import('@features/dashboard/pages/CaregiverDashboard'))
const KakaoCallbackPage = lazy(() => import('@features/auth/pages/KakaoCallback'))
const FamilyManagementPage = lazy(() => import('@features/family/pages/FamilyManagement'))
const FamilyInvitePage = lazy(() => import('@features/family/pages/FamilyInvite'))
const FamilyMemberDetailPage = lazy(() => import('@features/family/pages/FamilyMemberDetail'))
const InviteCodeEntryPage = lazy(() => import('@features/family/pages/InviteCodeEntry'))
const FamilyJoin = lazy(() => import('@features/family/pages/FamilyJoin'))
const SettingsPage = lazy(() => import('@features/settings/pages/Settings'))
const ProfileEditPage = lazy(() => import('@features/settings/pages/Profile/ProfileEdit'))
const NotificationSettingsPage = lazy(() => import('@features/settings/pages/Notifications/NotificationSettings'))
const MyMedicationsSettingsPage = lazy(() => import('@features/settings/pages/MyMedicationsSettingsPage'))
const MyDiseasesSettingsPage = lazy(() => import('@features/settings/pages/MyDiseasesSettingsPage'))
const PrivacyPolicyPage = lazy(() => import('@features/settings/pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('@features/settings/pages/TermsOfServicePage'))
const MedicationManagementPage = lazy(() => import('@features/medication/pages/MedicationManagement'))
const MedicationEditPage = lazy(() => import('@features/medication/pages/MedicationEditPage'))
const PrescriptionAddPage = lazy(() => import('@features/medication/pages/PrescriptionAddPage'))
const PrescriptionDetailPage = lazy(() => import('@features/medication/pages/PrescriptionDetailPage'))
const TodayMedications = lazy(() => import('@features/medication/pages/TodayMedications'))
const FoodWarningPage = lazy(() => import('@features/diet/pages/FoodWarning'))
const DietLogPage = lazy(() => import('@features/diet/pages/DietLogPage'))
const PrescriptionScanPage = lazy(() => import('@features/ocr/pages/PrescriptionScan'))
const UnifiedSearchPage = lazy(() => import('@features/search/pages/UnifiedSearchPage'))
const PillResultPage = lazy(() => import('@features/search/pages/PillResultPage'))
const DoctorCounselPage = lazy(() => import('@features/counsel/pages/DoctorCounsel'))
const DiseasePage = lazy(() => import('@features/disease/pages/Disease'))
const DiseaseDetailPage = lazy(() => import('@features/disease/pages/DiseaseDetailPage'))
const SuspectedDiseasePage = lazy(() => import('@features/disease/pages/SuspectedDiseasePage'))
const DiseaseRestrictionsPage = lazy(() => import('@features/disease/pages/DiseaseRestrictionsPage'))
const DoctorChatListPage = lazy(() => import('@features/chat/pages/DoctorChatListPage'))
const ChatConversationPage = lazy(() => import('@features/chat/pages/ChatConversationPage'))
const FamilyChatConversationPage = lazy(() => import('@features/chat/pages/FamilyChatConversationPage'))
const NotificationPage = lazy(() => import('@features/notification/pages/NotificationPage'))
const NotificationDetailPage = lazy(() => import('@features/notification/pages/NotificationDetailPage'))
const AdherenceReportPage = lazy(() => import('@features/report/pages/AdherenceReportPage'))
const WeeklyStatsPage = lazy(() => import('@features/report/pages/WeeklyStatsPage'))
const MorePage = lazy(() => import('@pages/more/MorePage'))
const DeveloperModePanel = lazy(() => import('@devtools/DeveloperModePanel'))
const WsTestPage = lazy(() => import('@pages/WsTestPage'))

import ErrorBoundary from '@shared/components/ErrorBoundary'
import ErrorFallback from '@shared/components/ErrorFallback'
import ToastContainer from '@shared/components/toast/ToastContainer'
import { setNavigator } from '@core/routing/navigation'
import { useNotificationStream } from '@features/notification/hooks/useNotificationStream'

function NavigationRegistrar() {
  const navigate = useNavigate()

  // 실시간 알림 스트림 초기화
  useNotificationStream()

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])
  return null
}

/**
 * 루트 경로 리다이렉트 컴포넌트
 * - 인증된 사용자: 역할에 맞는 대시보드로 이동
 * - 비인증 사용자: 로그인 페이지로 이동
 */
function HomeRedirect() {
  const { isAuthenticated, customerRole, _hasHydrated, token } = useAuth((state) => ({
    isAuthenticated: state.isAuthenticated,
    customerRole: state.customerRole,
    _hasHydrated: state._hasHydrated,
    token: state.token,
  }))

  // Hydration 미완료 시 로딩 표시
  if (!_hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        로딩 중...
      </div>
    )
  }

  // isAuthenticated + 실제 token 존재 여부 확인
  if (isAuthenticated && token) {
    if (customerRole === 'SENIOR') {
      return <Navigate to={ROUTE_PATHS.seniorDashboard} replace />
    }
    if (customerRole === 'CAREGIVER') {
      return <Navigate to={ROUTE_PATHS.caregiverDashboard} replace />
    }
    // 역할이 선택되지 않은 경우 역할 선택 페이지로 (혹은 기본 대시보드)
    return <Navigate to={ROUTE_PATHS.roleSelection} replace />
  }

  return <Navigate to={ROUTE_PATHS.login} replace />
}

/**
 * 레거시 초대 경로 리다이렉트
 * /invites/accept?token=xxx → /invites/enter?token=xxx
 * query parameters를 보존하면서 리다이렉트
 */
function InviteAcceptRedirect() {
  const [searchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const targetPath = queryString ? `/invites/enter?${queryString}` : '/invites/enter'
  return <Navigate to={targetPath} replace />
}

/**
 * 메인 App 컴포넌트
 * @returns {JSX.Element}
 */
function App() {
  const showDevTools = envConfig.isDevelopment && envConfig.ENABLE_DEV_MODE

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <FamilyProvider>
            <NavigationRegistrar />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* 공개 페이지: 인증 불필요 */}
                <Route path={ROUTE_PATHS.login} element={<Login />} />
                <Route path={ROUTE_PATHS.signup} element={<Signup />} />
                <Route path={ROUTE_PATHS.kakaoCallback} element={<KakaoCallbackPage />} />
                <Route path={ROUTE_PATHS.deeplink} element={<DeepLinkResolverPage />} />
                <Route path={ROUTE_PATHS.privacyPolicy} element={<PrivacyPolicyPage />} />
                <Route path={ROUTE_PATHS.termsOfService} element={<TermsOfServicePage />} />

                {/* 초대 코드 입력 및 링크 진입 (공개) - 통합 랜딩 페이지 */}
                <Route path={ROUTE_PATHS.inviteCodeEntry} element={<InviteCodeEntryPage />} />
                {/* 레거시 경로 호환: /invites/accept → /invites/enter 리다이렉트 (query params 보존) */}
                <Route path="/invites/accept" element={<InviteAcceptRedirect />} />
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

                {/* 처방전 관리 (신규) */}
                <Route
                  path={ROUTE_PATHS.prescriptionAdd}
                  element={<PrivateRoute element={<PrescriptionAddPage />} />}
                />
                <Route
                  path={ROUTE_PATHS.prescriptionDetail}
                  element={<PrivateRoute element={<PrescriptionDetailPage />} />}
                />

                {/* 기존 라우트 호환성 유지 (리다이렉트) */}
                <Route
                  path={ROUTE_PATHS.medicationAdd}
                  element={<Navigate to={ROUTE_PATHS.prescriptionAdd} replace />}
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

                {/* 기본 경로: 인증 상태에 따라 대시보드 또는 로그인 페이지로 리다이렉트 */}
                <Route path={ROUTE_PATHS.root} element={<HomeRedirect />} />

                {/* 404: 존재하지 않는 경로 */}
                <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
              </Routes>
            </Suspense>
            <ToastContainer />
            {showDevTools && (
              <Suspense fallback={null}>
                <DeveloperModePanel />
              </Suspense>
            )}
          </FamilyProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

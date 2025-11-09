/**
 * App.jsx - 메인 라우팅 설정
 *
 * 라우팅 구조:
 * / → Login (로그인 페이지 + 개발자 뒷구멍)
 * /signup → Signup (회원가입)
 * /role-selection → RoleSelection (역할 선택) - PrivateRoute 보호
 * /dashboard → SeniorDashboard (시니어 대시보드) - PrivateRoute 보호
 * /guardian → GuardianDashboard (보호자 대시보드) - PrivateRoute 보호
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './core/routing/PrivateRoute'
import { Login } from './pages/Auth/Login'
import { Signup } from './pages/Auth/Signup'
import { RoleSelection } from './pages/RoleSelection'
import { SeniorDashboard } from './pages/Dashboard/SeniorDashboard'
import { GuardianDashboard } from './pages/Dashboard/GuardianDashboard'
import KakaoCallbackPage from './pages/Auth/KakaoCallback'
import DeveloperModePanel from './components/common/DeveloperModePanel'
import './App.css'

/**
 * 메인 App 컴포넌트
 * @returns {JSX.Element}
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 공개 페이지: 인증 불필요 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />

          {/* 보호된 페이지: 인증 필요 */}
          <Route
            path="/role-selection"
            element={<PrivateRoute element={<RoleSelection />} />}
          />
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<SeniorDashboard />} />}
          />
          <Route
            path="/guardian"
            element={<PrivateRoute element={<GuardianDashboard />} />}
          />

          {/* 메뉴바의 다른 페이지들 (스텁) - PrivateRoute 보호 */}
          <Route
            path="/medication"
            element={<PrivateRoute element={<SeniorDashboard />} />}
          />
          <Route
            path="/search"
            element={<PrivateRoute element={<SeniorDashboard />} />}
          />
          <Route
            path="/counsel"
            element={<PrivateRoute element={<SeniorDashboard />} />}
          />
          <Route
            path="/disease"
            element={<PrivateRoute element={<GuardianDashboard />} />}
          />
          <Route
            path="/settings"
            element={<PrivateRoute element={<SeniorDashboard />} />}
          />

          {/* 기본 경로: 로그인 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404: 존재하지 않는 경로 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <DeveloperModePanel />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

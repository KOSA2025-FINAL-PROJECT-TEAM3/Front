/**
 * App.jsx - 메인 라우팅 설정
 *
 * 라우팅 구조:
 * / → Login (로그인 페이지 + 개발자 뒷구멍)
 * /signup → Signup (회원가입)
 * /role-select → RoleSelection (역할 선택)
 * /dashboard → SeniorDashboard (시니어 대시보드)
 * /guardian → GuardianDashboard (보호자 대시보드)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Auth/Login'
import { Signup } from './pages/Auth/Signup'
import { RoleSelection } from './pages/RoleSelection'
import { SeniorDashboard } from './pages/Dashboard/SeniorDashboard'
import { GuardianDashboard } from './pages/Dashboard/GuardianDashboard'
import './App.css'

/**
 * 메인 App 컴포넌트
 * @returns {JSX.Element}
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role-select" element={<RoleSelection />} />

        {/* 대시보드 */}
        <Route path="/dashboard" element={<SeniorDashboard />} />
        <Route path="/guardian" element={<GuardianDashboard />} />

        {/* 메뉴바의 다른 페이지들 (스텁) */}
        <Route path="/medication" element={<SeniorDashboard />} />
        <Route path="/search" element={<SeniorDashboard />} />
        <Route path="/counsel" element={<SeniorDashboard />} />
        <Route path="/disease" element={<GuardianDashboard />} />
        <Route path="/settings" element={<SeniorDashboard />} />

        {/* 기본 경로: 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404: 존재하지 않는 경로 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

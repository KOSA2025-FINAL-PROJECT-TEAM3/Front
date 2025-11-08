/**
 * App.jsx - 메인 라우팅 설정
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
        {/* 기본 경로: 시니어 대시보드로 이동 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 시니어 대시보드 */}
        <Route path="/dashboard" element={<SeniorDashboard />} />

        {/* 보호자 대시보드 */}
        <Route path="/guardian" element={<GuardianDashboard />} />

        {/* 메뉴바의 다른 페이지들 (스텁) */}
        <Route path="/medication" element={<SeniorDashboard />} />
        <Route path="/search" element={<SeniorDashboard />} />
        <Route path="/counsel" element={<SeniorDashboard />} />
        <Route path="/disease" element={<GuardianDashboard />} />
        <Route path="/settings" element={<SeniorDashboard />} />

        {/* 404: 존재하지 않는 경로 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

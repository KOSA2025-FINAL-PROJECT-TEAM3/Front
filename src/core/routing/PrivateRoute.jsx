/**
 * PrivateRoute - 보호된 라우트
 * - 인증된 사용자만 접근 가능
 * - 미인증 사용자는 로그인 페이지로 리다이렉트
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'

/**
 * 보호된 라우트 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.element - 렌더링할 컴포넌트
 * @returns {JSX.Element} element 또는 Navigate
 */
export const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth()

  // 로딩 중: 로딩 화면 표시
  if (loading) {
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

  // 인증됨: element 렌더링
  if (isAuthenticated) {
    return element
  }

  // 미인증: 로그인 페이지로 리다이렉트
  return <Navigate to="/login" replace />
}

export default PrivateRoute

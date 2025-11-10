/**
 * PrivateRoute - 보호 라우트
 * - 인증 사용자만 접근 가능
 * - 미인증 사용자는 로그인으로 리다이렉트
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { ROUTE_PATHS } from '@config/routes.config'

/**
 * 보호 라우트 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.element - 렌더링할 컴포넌트
 * @returns {JSX.Element} element 또는 Navigate
 */
export const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth()

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

  if (isAuthenticated) {
    return element
  }

  return <Navigate to={ROUTE_PATHS.login} replace />
}

export default PrivateRoute


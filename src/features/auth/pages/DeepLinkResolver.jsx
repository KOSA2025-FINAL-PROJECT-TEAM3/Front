import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApiClient } from '@core/services/api/authApiClient'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import { BackButton } from '@shared/components/mui/BackButton'

const resolveFallbackPath = (user) => {
  const role = user?.customerRole || user?.userRole
  if (role === 'CAREGIVER') return ROUTE_PATHS.caregiverDashboard
  if (role === 'SENIOR') return ROUTE_PATHS.seniorDashboard
  return ROUTE_PATHS.roleSelection
}

const sanitizeTarget = (raw) => {
  if (!raw || typeof raw !== 'string') return null
  // 내부 경로만 허용 (open redirect 방지)
  if (raw.startsWith('/')) return raw
  return null
}

const LoadingView = ({ message }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '12px',
    color: '#374151',
    fontSize: '16px'
  }}>
    <div style={{ width: '100%', maxWidth: 520, padding: '0 16px', display: 'flex', justifyContent: 'flex-start' }}>
      <BackButton label="뒤로" />
    </div>
    <div className="loader" style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '4px solid #e5e7eb',
      borderTopColor: '#2563eb',
      animation: 'spin 1s linear infinite'
    }} />
    <p>{message}</p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

const ErrorView = ({ onRetry }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '12px',
    color: '#991b1b',
    fontSize: '16px'
  }}>
    <div style={{ width: '100%', maxWidth: 520, padding: '0 16px', display: 'flex', justifyContent: 'flex-start' }}>
      <BackButton label="뒤로" />
    </div>
    <p>딥링크 인증에 실패했습니다.</p>
    <button
      onClick={onRetry}
      style={{
        padding: '10px 16px',
        borderRadius: '10px',
        border: '1px solid #dc2626',
        background: '#fee2e2',
        color: '#b91c1c',
        cursor: 'pointer'
      }}
    >
      다시 시도
    </button>
  </div>
)

const DeepLinkResolverPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const setAuthData = useAuthStore((state) => state.setAuthData)

  const deeplinkToken = useMemo(() => searchParams.get('token') || searchParams.get('deeplinkToken'), [searchParams])
  const rawTarget = useMemo(() => searchParams.get('target'), [searchParams])

  useEffect(() => {
    const run = async () => {
      if (!deeplinkToken) {
        toast.error('유효하지 않은 딥링크입니다. 다시 로그인해주세요.')
        navigate(ROUTE_PATHS.login, { replace: true })
        return
      }

      try {
        setStatus('loading')
        const response = await authApiClient.resolveDeeplink(deeplinkToken, rawTarget || undefined)

        // 인증 스토어에 반영
        setAuthData({
          user: response.user,
          token: response.accessToken,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          customerRole: response?.user?.customerRole,
          userRole: response?.user?.userRole,
        })

        const safeTarget = sanitizeTarget(rawTarget || response.target)
        const nextPath = safeTarget || resolveFallbackPath(response.user)
        toast.success('인증이 완료되었습니다.')
        navigate(nextPath, { replace: true })
      } catch (error) {
        console.error('[DeepLink] resolve failed', error)
        toast.error(error?.message || '딥링크 처리에 실패했습니다.')
        setStatus('error')
      }
    }

    run()
  }, [deeplinkToken, rawTarget, navigate, setAuthData])

  if (status === 'error') {
    return <ErrorView onRetry={() => {
      setStatus('loading')
      navigate(ROUTE_PATHS.login, { replace: true })
    }} />
  }

  return <LoadingView message="딥링크를 확인하고 있습니다..." />
}

export default DeepLinkResolverPage

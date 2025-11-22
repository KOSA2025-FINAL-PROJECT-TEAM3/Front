import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { ROUTE_PATHS } from '@config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import { useFamily } from '../hooks/useFamily'

export const InviteAcceptPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const { acceptInvite, refetchFamily } = useFamily((state) => ({
    acceptInvite: state.acceptInvite,
    refetchFamily: state.refetchFamily,
  }))

  const [status, setStatus] = useState(code ? 'pending' : 'error')
  const [message, setMessage] = useState(
    code ? '초대를 확인하는 중입니다...' : '초대 코드가 없습니다.',
  )

  useEffect(() => {
    if (!code) return
    const run = async () => {
      setStatus('loading')
      setMessage('초대를 수락하는 중입니다...')
      try {
        await acceptInvite?.(code)
        await refetchFamily?.()
        setStatus('success')
        setMessage('초대를 수락했습니다. 가족 페이지로 이동합니다.')
        toast.success('초대를 수락했어요.')
        setTimeout(() => navigate(ROUTE_PATHS.family, { replace: true }), 800)
      } catch (error) {
        console.warn('[InviteAccept] acceptInvite failed', error)
        setStatus('error')
        const friendly =
          error?.response?.status === 400
            ? '초대 코드가 만료되었거나 잘못되었습니다.'
            : error?.response?.status === 401
              ? '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.'
              : error?.response?.status === 409
                ? '이미 이 가족에 속해 있습니다.'
                : '초대 수락에 실패했습니다. 다시 시도하거나 관리자에게 문의하세요.'
        setMessage(friendly)
        toast.error(friendly)
      }
    }
    run()
  }, [code, acceptInvite, refetchFamily, navigate])

  return (
    <MainLayout showBottomNav={false}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>초대 수락</h1>
        <p style={{ margin: 0 }}>{message}</p>
        {status === 'error' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => navigate(ROUTE_PATHS.familyInvite)}>
              초대 다시 요청
            </button>
            <button type="button" onClick={() => navigate(ROUTE_PATHS.family)}>
              가족 페이지로 이동
            </button>
          </div>
        )}
        {status === 'success' && (
          <button type="button" onClick={() => navigate(ROUTE_PATHS.family)}>
            바로 이동
          </button>
        )}
      </div>
    </MainLayout>
  )
}

export default InviteAcceptPage

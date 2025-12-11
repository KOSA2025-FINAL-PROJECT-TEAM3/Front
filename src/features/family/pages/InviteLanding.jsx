import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import styles from './InviteLanding.module.css' // We might need to create this CSS or use inline styles for now

const InviteLanding = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const { user } = useAuthStore()

    const [status, setStatus] = useState('verifying') // verifying, accepting, success, error

    useEffect(() => {
        const processInvite = async () => {
            if (!token) {
                toast.error('유효하지 않은 초대 링크입니다.')
                navigate(ROUTE_PATHS.home)
                return
            }

            // 1. 로그인 체크
            if (!user) {
                // 로그인 안되어있으면 로그인 페이지로 이동 (리다이렉트 URL 포함)
                sessionStorage.setItem('pendingInviteToken', token) // 로그인 후 처리를 위해 저장
                toast.info('초대를 수락하려면 먼저 로그인해주세요.')
                navigate(ROUTE_PATHS.login, {
                    state: { from: `/invites/enter?token=${token}` }
                })
                return
            }

            // 2. 초대 수락 요청
            try {
                setStatus('accepting')
                // API 호출: token을 사용하여 수락
                await familyApiClient.acceptInvite({ token })

                setStatus('success')
                toast.success('가족 그룹에 성공적으로 가입되었습니다!')

                // 잠시 후 대시보드로 이동
                setTimeout(() => {
                    if (user.customerRole === 'SENIOR') {
                        navigate(ROUTE_PATHS.seniorDashboard)
                    } else {
                        navigate(ROUTE_PATHS.caregiverDashboard)
                    }
                }, 1500)

            } catch (error) {
                console.error('Invite accept failed', error)
                setStatus('error')
                if (error.response?.data?.code === 'MEMBER_ALREADY_EXISTS') {
                    toast.info('이미 그룹에 가입되어 있습니다.')
                    navigate(ROUTE_PATHS.home)
                } else {
                    toast.error(error?.message || '초대 수락에 실패했습니다.')
                }
            }
        }

        processInvite()
    }, [token, user, navigate])

    if (status === 'success') {
        return (
            <div className="container">
                <h1>🎉 환영합니다!</h1>
                <p>가족 그룹 가입이 완료되었습니다.</p>
                <p>잠시 후 대시보드로 이동합니다...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="container">
                <h1>⚠️ 오류 발생</h1>
                <p>초대를 처리하는 중 문제가 발생했습니다.</p>
                <button onClick={() => navigate(ROUTE_PATHS.home)}>홈으로 돌아가기</button>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="loading-spinner"></div>
            <p>초대장을 확인하고 있습니다...</p>
        </div>
    )
}

export default InviteLanding

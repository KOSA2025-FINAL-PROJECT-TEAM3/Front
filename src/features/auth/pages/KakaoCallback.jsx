/**
 * KakaoCallback Page
 * - 카카오 OAuth 성공/실패 처리
 * - code/state 파라미터를 Auth Store kakaoLogin에 전달
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useInviteStore } from '@features/family/stores/inviteStore'
import { STORAGE_KEYS, USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './KakaoCallback.module.scss'

export const KakaoCallbackPage = () => {
  const navigate = useNavigate()
  const { kakaoLogin } = useAuth((state) => ({ kakaoLogin: state.kakaoLogin }))
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('카카오 로그인 처리 중입니다...')
  const [errorMessage, setErrorMessage] = useState(null)

  const processedRef = useRef(false)

  // 1. Login Trigger Effect (Runs once)
  useEffect(() => {
    if (processedRef.current) return

    const code = searchParams.get('code')
    const receivedState = searchParams.get('state')
    const kakaoError = searchParams.get('error')
    const kakaoErrorDescription = searchParams.get('error_description')
    const expectedState =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEYS.KAKAO_STATE)
        : null

    if (kakaoError) {
      setStatus('카카오 로그인에 실패했습니다.')
      setErrorMessage(kakaoErrorDescription || kakaoError)
      return
    }

    if (!code) {
      setStatus('카카오 인증 코드가 없습니다.')
      setErrorMessage('다시 로그인 화면으로 이동해 주세요.')
      return
    }

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      setStatus('카카오 인증 요청이 유효하지 않습니다.')
      setErrorMessage('브라우저를 새로고침 후 다시 로그인해 주세요.')
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
      }
      return
    }

    // Mark as processed to prevent double-invocation
    processedRef.current = true

    const runLogin = async () => {
      try {
        await kakaoLogin(code)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
        }
      } catch (err) {
        setStatus('카카오 로그인 과정에서 오류가 발생했습니다.')
        setErrorMessage(err.message || '잠시 후 다시 시도해 주세요.')
        // Reset processed ref on error to allow retry if needed (though code is likely invalid now)
      }
    }

    runLogin()
  }, [kakaoLogin, searchParams])

  // 2. Navigation Effect (Reacts to auth state changes)
  const { isAuthenticated, customerRole, user } = useAuth((state) => ({
    isAuthenticated: state.isAuthenticated,
    customerRole: state.customerRole,
    user: state.user,
  }))

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Check for valid invite session first
      const { isSessionValid } = useInviteStore.getState()
      if (isSessionValid()) {
        console.log('[KakaoCallback] Redirecting to invite entry due to valid session')
        navigate(ROUTE_PATHS.inviteCodeEntry, { replace: true })
        return
      }

      const role =
        normalizeCustomerRole(customerRole) ||
        normalizeCustomerRole(user?.customerRole)

      if (!role) {
        navigate(ROUTE_PATHS.roleSelection, { replace: true })
      } else if (role === USER_ROLES.SENIOR) {
        navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
      } else if (role === USER_ROLES.CAREGIVER) {
        navigate(ROUTE_PATHS.caregiverDashboard, { replace: true })
      }
    }
  }, [isAuthenticated, customerRole, user, navigate])

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.logo}>💊</div>
        <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
        <p className={styles.status}>{status}</p>
        {errorMessage && (
          <>
            <p className={styles.error}>{errorMessage}</p>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate(ROUTE_PATHS.login, { replace: true })}
            >
              로그인 화면으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default KakaoCallbackPage

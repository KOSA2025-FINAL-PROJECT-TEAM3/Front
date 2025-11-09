/**
 * KakaoCallback 페이지
 * - 카카오 OAuth 성공/실패 처리
 * - code 쿼리 파라미터를 Auth Store kakaoLogin에 전달
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { STORAGE_KEYS } from '@config/constants'
import styles from './KakaoCallback.module.scss'

export const KakaoCallbackPage = () => {
  const navigate = useNavigate()
  const { kakaoLogin } = useAuth((state) => ({
    kakaoLogin: state.kakaoLogin,
  }))
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('카카오 로그인 중입니다...')
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const receivedState = searchParams.get('state')
    const kakaoError = searchParams.get('error')
    const kakaoErrorDescription = searchParams.get('error_description')
    const expectedState = typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEYS.KAKAO_STATE)
      : null

    if (kakaoError) {
      setStatus('카카오 로그인에 실패했습니다.')
      setErrorMessage(kakaoErrorDescription || kakaoError)
      return
    }

    if (!code) {
      setStatus('카카오 인증 코드가 없습니다.')
      setErrorMessage('다시 로그인 화면으로 이동해주세요.')
      return
    }

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      setStatus('카카오 인증 요청이 유효하지 않습니다.')
      setErrorMessage('브라우저를 새로고침 후 다시 로그인해주세요.')
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
      }
      return
    }

    let cancelled = false

    const runLogin = async () => {
      try {
        await kakaoLogin(code)
        if (!cancelled) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEYS.KAKAO_STATE)
          }
          navigate('/role-selection', { replace: true })
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('카카오 로그인 과정에서 오류가 발생했습니다.')
          setErrorMessage(err.message || '잠시 후 다시 시도해주세요.')
        }
      }
    }

    runLogin()

    return () => {
      cancelled = true
    }
  }, [kakaoLogin, navigate, searchParams])

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
              onClick={() => navigate('/login', { replace: true })}
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

/**
 * KakaoLoginButton
 * - Kakao OAuth login button
 * - Requires: VITE_KAKAO_CLIENT_ID, VITE_KAKAO_REDIRECT_URI
 */

import classNames from 'classnames'
import { STORAGE_KEYS } from '@config/constants'
import styles from './KakaoLoginButton.module.scss'
import { ROUTE_PATHS } from '@config/routes.config'

const KAKAO_AUTH_BASE = 'https://kauth.kakao.com/oauth/authorize'

const buildRedirectUri = () => {
  if (import.meta.env.VITE_KAKAO_REDIRECT_URI) {
    return import.meta.env.VITE_KAKAO_REDIRECT_URI
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${ROUTE_PATHS.kakaoCallback}`
  }
  return ''
}

export const KakaoLoginButton = ({
  label = '카카오로 로그인',
  className,
  disabled = false,
  onUnavailable,
}) => {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID
  const redirectUri = buildRedirectUri()

  const handleClick = () => {
    if (!clientId || !redirectUri) {
      const msg = '카카오 OAuth 환경 변수가 설정되지 않았습니다.'
      if (typeof onUnavailable === 'function') {
        onUnavailable(msg)
      } else {
        window.alert(msg)
      }
      return
    }

    const state = crypto.randomUUID?.() || Date.now().toString()
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.KAKAO_STATE, state)
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    })
    const authUrl = `${KAKAO_AUTH_BASE}?${params.toString()}`
    window.location.href = authUrl
  }

  return (
    <button
      type="button"
      className={classNames(styles.kakaoButton, className)}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className={styles.icon}>K</span>
      {label}
    </button>
  )
}

export default KakaoLoginButton

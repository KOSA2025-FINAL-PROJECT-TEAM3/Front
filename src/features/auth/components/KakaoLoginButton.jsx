/**
 * KakaoLoginButton
 * - Kakao OAuth login button
 * - Requires: VITE_KAKAO_CLIENT_ID, VITE_KAKAO_REDIRECT_URI
 */

import { Box, Button } from '@mui/material'
import { STORAGE_KEYS } from '@config/constants'
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
      } else if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined') window.location.href = authUrl
  }

  return (
    <Button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled}
      fullWidth
      variant="contained"
      disableElevation
      startIcon={
        <Box
          aria-hidden
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.1)',
            color: '#381e1f',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          K
        </Box>
      }
      sx={{
        bgcolor: '#FEE500',
        color: '#381e1f',
        borderRadius: 2,
        py: 1.5,
        fontWeight: 800,
        textTransform: 'none',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          bgcolor: '#FDD835',
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 22px rgba(0, 0, 0, 0.12)',
        },
        '&:disabled': {
          opacity: 0.6,
          boxShadow: 'none',
        },
      }}
    >
      {label}
    </Button>
  )
}

export default KakaoLoginButton

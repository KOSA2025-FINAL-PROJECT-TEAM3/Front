/**
 * InviteCodeEntry.jsx
 * 초대 코드 수동 입력 페이지 (공개 페이지)
 *
 * 흐름:
 * 1. 사용자가 6자리 초대 코드 입력
 * 2. 코드 유효성 검증 및 초대 정보 조회
 * 3. 초대 정보 표시 (가족 그룹명, 초대자, 역할)
 * 4. 로그인 여부에 따라:
 *    - 로그인됨: 바로 수락 가능
 *    - 비로그인: 로그인 페이지로 이동 (세션에 초대 정보 저장)
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { STORAGE_KEYS } from '@config/constants'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { useInviteStore } from '../stores/inviteStore'
import { useFamily } from '../hooks/useFamily'
import { toast } from '@shared/components/toast/toastStore'
import styles from './InviteCodeEntry.module.scss'

const ROLE_LABELS = {
  SENIOR: '시니어 (돌봄 대상자)',
  CAREGIVER: '보호자 (케어기버)',
}

const ROLE_ICONS = {
  SENIOR: '👴',
  CAREGIVER: '🤝',
}

export const InviteCodeEntryPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // URL에서 초대 코드 파라미터 확인
  const codeFromUrl = searchParams.get('code')

  const { setInviteSession, clearInviteSession, inviteSession } = useInviteStore()
  const { acceptInvite, refetchFamily } = useFamily((state) => ({
    acceptInvite: state.acceptInvite,
    refetchFamily: state.refetchFamily,
  }))

  // 상태
  const [inputCode, setInputCode] = useState(codeFromUrl || '')
  const [status, setStatus] = useState('idle') // idle, validating, validated, accepting, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [inviteInfo, setInviteInfo] = useState(null)

  // 로그인 여부 확인
  const isLoggedIn = Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))

  // URL에 코드가 있으면 자동 검증
  useEffect(() => {
    if (codeFromUrl && status === 'idle') {
      handleValidateCode(codeFromUrl)
    }
  }, [codeFromUrl])

  // 이전에 저장된 세션이 있으면 복원
  useEffect(() => {
    if (inviteSession && !inviteInfo && status === 'idle') {
      setInviteInfo(inviteSession)
      setInputCode(inviteSession.inviteCode || '')
      setStatus('validated')
    }
  }, [inviteSession])

  // 코드 입력 핸들러 (6자리 제한, 대문자 변환)
  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setInputCode(value)
    // 에러 초기화
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  // 코드 유효성 검증
  const handleValidateCode = async (code = inputCode) => {
    if (code.length !== 6) {
      setErrorMessage('6자리 초대 코드를 입력해주세요.')
      return
    }

    setStatus('validating')
    setErrorMessage('')

    try {
      const response = await familyApiClient.validateInviteCode(code)

      const info = {
        inviteCode: code,
        groupName: response.groupName || '가족 그룹',
        inviterName: response.inviterName || '알 수 없음',
        suggestedRole: response.suggestedRole || 'SENIOR',
        expiresAt: response.expiresAt,
      }

      setInviteInfo(info)
      setInviteSession(info)
      setStatus('validated')
    } catch (error) {
      console.warn('[InviteCodeEntry] validateInviteCode failed', error)
      setStatus('error')

      if (error?.response?.status === 400) {
        setErrorMessage('초대 코드가 만료되었거나 잘못되었습니다.')
      } else if (error?.response?.status === 404) {
        setErrorMessage('존재하지 않는 초대 코드입니다.')
      } else {
        setErrorMessage('초대 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    }
  }

  // 초대 수락
  const handleAcceptInvite = async () => {
    if (!inviteInfo?.inviteCode) return

    setStatus('accepting')

    try {
      await acceptInvite(inviteInfo.inviteCode)
      await refetchFamily?.()

      setStatus('success')
      clearInviteSession()
      toast.success('가족 초대를 수락했습니다!')

      // 역할에 따라 적절한 대시보드로 이동
      setTimeout(() => {
        if (inviteInfo.suggestedRole === 'CAREGIVER') {
          navigate(ROUTE_PATHS.caregiverDashboard, { replace: true })
        } else {
          navigate(ROUTE_PATHS.seniorDashboard, { replace: true })
        }
      }, 1500)
    } catch (error) {
      console.warn('[InviteCodeEntry] acceptInvite failed', error)
      setStatus('validated')

      if (error?.response?.status === 400) {
        toast.error('초대 코드가 만료되었거나 잘못되었습니다.')
      } else if (error?.response?.status === 409) {
        toast.error('이미 이 가족에 속해 있습니다.')
        navigate(ROUTE_PATHS.family, { replace: true })
      } else if (error?.response?.status === 401) {
        toast.warning('로그인이 필요합니다.')
        navigate(ROUTE_PATHS.login)
      } else {
        toast.error('초대 수락에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  // 로그인 페이지로 이동 (세션 유지)
  const handleGoToLogin = () => {
    // 세션은 이미 저장되어 있으므로 로그인 후 다시 이 페이지로 돌아오면 복원됨
    navigate(ROUTE_PATHS.login)
  }

  // 다시 입력
  const handleReset = () => {
    setInputCode('')
    setInviteInfo(null)
    setStatus('idle')
    setErrorMessage('')
    clearInviteSession()
  }

  // 만료 시간 포맷
  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return null
    const date = new Date(expiresAt)
    const now = new Date()
    const diffMs = date - now

    if (diffMs <= 0) return '만료됨'

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}일 후 만료`
    } else if (diffHours > 0) {
      return `${diffHours}시간 ${diffMinutes}분 후 만료`
    } else {
      return `${diffMinutes}분 후 만료`
    }
  }

  // 성공 화면
  if (status === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h2>가족에 합류했습니다!</h2>
            <p>잠시 후 대시보드로 이동합니다...</p>
          </div>
        </div>
      </div>
    )
  }

  // 검증 완료 후 초대 정보 표시
  if (status === 'validated' && inviteInfo) {
    const role = inviteInfo.suggestedRole || 'SENIOR'
    const expiryText = formatExpiry(inviteInfo.expiresAt)

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>가족 초대</h1>
            <p>아래 정보를 확인하고 가족에 합류하세요</p>
          </div>

          <div className={styles.inviteInfo}>
            <h2>초대 정보</h2>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>가족 그룹</span>
              <span className={styles.infoValue}>{inviteInfo.groupName}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>초대한 사람</span>
              <span className={styles.infoValue}>{inviteInfo.inviterName}</span>
            </div>

            <div className={styles.roleSection}>
              <p>가입 시 부여될 역할</p>
              <span className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}>
                <span className={styles.roleIcon}>{ROLE_ICONS[role]}</span>
                {ROLE_LABELS[role] || role}
              </span>
            </div>

            {expiryText && (
              <p className={styles.expiryWarning}>
                {expiryText === '만료됨' ? '⚠️ 이 초대는 만료되었습니다' : `⏰ ${expiryText}`}
              </p>
            )}
          </div>

          <div className={styles.actions}>
            {isLoggedIn ? (
              <button
                type="button"
                className={styles.acceptButton}
                onClick={handleAcceptInvite}
                disabled={status === 'accepting' || expiryText === '만료됨'}
              >
                {status === 'accepting' ? '처리 중...' : '초대 수락하기'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.loginButton}
                  onClick={handleGoToLogin}
                >
                  로그인하고 수락하기
                </button>
                <button
                  type="button"
                  className={styles.acceptButton}
                  onClick={() => navigate(ROUTE_PATHS.signup)}
                >
                  회원가입하고 수락하기
                </button>
              </>
            )}

            <button type="button" className={styles.cancelButton} onClick={handleReset}>
              다른 코드 입력하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 기본: 코드 입력 폼
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>초대 코드 입력</h1>
          <p>가족으로부터 받은 6자리 초대 코드를 입력하세요</p>
        </div>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="invite-code">초대 코드</label>
            <input
              id="invite-code"
              type="text"
              className={styles.codeInput}
              value={inputCode}
              onChange={handleCodeChange}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              autoFocus
              disabled={status === 'validating'}
            />
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <button
            type="button"
            className={styles.submitButton}
            onClick={() => handleValidateCode()}
            disabled={inputCode.length !== 6 || status === 'validating'}
          >
            {status === 'validating' ? (
              <span>확인 중...</span>
            ) : (
              <span>코드 확인</span>
            )}
          </button>
        </div>

        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => navigate(-1)}
        >
          뒤로 가기
        </button>
      </div>
    </div>
  )
}

export default InviteCodeEntryPage

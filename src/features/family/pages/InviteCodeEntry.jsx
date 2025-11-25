/**
 * InviteCodeEntry.jsx
 * 초대 코드 수동 입력 페이지 (공개)
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { STORAGE_KEYS } from '@config/constants'
import { publicInviteApiClient } from '@core/services/api/publicInviteApiClient'
import { useInviteStore } from '../stores/inviteStore'
import { useFamily } from '../hooks/useFamily'
import { toast } from '@shared/components/toast/toastStore'
import styles from './InviteCodeEntry.module.scss'

const ROLE_LABELS = {
  SENIOR: '시니어(케어 대상자)',
  CAREGIVER: '보호자(케어 제공자)',
}

const ROLE_ICONS = {
  SENIOR: '👵',
  CAREGIVER: '🧑‍⚕️',
}

export const InviteCodeEntryPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tokenFromUrl = searchParams.get('token')

  const { setInviteSession, clearInviteSession, inviteSession } = useInviteStore()
  const { acceptInvite, refetchFamily } = useFamily((state) => ({
    acceptInvite: state.acceptInvite,
    refetchFamily: state.refetchFamily,
  }))

  const [inputCode, setInputCode] = useState('') // No initial codeFromUrl, only for manual entry
  const [status, setStatus] = useState('idle') // idle, validating, validated, accepting, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [inviteInfo, setInviteInfo] = useState(null)

  const isLoggedIn = Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))

  useEffect(() => {
    if (tokenFromUrl && status === 'idle') {
      // If token is present, validate the token
      handleValidateCode(tokenFromUrl)
    }
  }, [tokenFromUrl])

  useEffect(() => {
    if (inviteSession && !inviteInfo && status === 'idle') {
      setInviteInfo(inviteSession)
      setInputCode(inviteSession.shortCode || inviteSession.inviteCode || '')
      setStatus('validated')
    }
  }, [inviteSession])

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setInputCode(value)
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleValidateCode = async (valueToValidate = inputCode) => {
    // long_token (64자) vs short_code (6자) 구분
    const isLongToken = valueToValidate.length > 6
    
    if (!isLongToken && valueToValidate.length !== 6) {
      setErrorMessage('6자리 초대 코드를 입력해주세요.')
      return
    }

    setStatus('validating')
    setErrorMessage('')

    try {
      let response
      
      if (isLongToken) {
        // long_token인 경우: /invite/start API 호출
        response = await publicInviteApiClient.startInvite(valueToValidate)
      } else {
        // short_code인 경우: 직접 사용 (startInvite API는 long_token만 받음)
        // short_code는 accept 시에만 사용되므로 여기서는 세션에 저장만
        response = {
          shortCode: valueToValidate,
          suggestedRole: 'SENIOR', // 기본값 (실제로는 accept 시 검증됨)
        }
      }

      const info = {
        inviteCode: response.shortCode || valueToValidate,
        shortCode: response.shortCode || valueToValidate,
        groupId: response.groupId,
        groupName: response.groupName || '가족 그룹',
        inviterName: response.inviterName || '알 수 없음',
        inviterEmail: response.inviterEmail,
        suggestedRole: response.suggestedRole || 'SENIOR',
        expiresAt: response.expiresAt,
      }

      setInviteInfo(info)
      setInviteSession(info)
      setStatus('validated')
    } catch (error) {
      console.warn('[InviteCodeEntry] getInviteInfo failed', error)
      setStatus('error')

      if (error?.response?.status === 400) {
        setErrorMessage('초대 코드가 만료되었거나 잘못되었습니다.')
      } else if (error?.response?.status === 404) {
        setErrorMessage('존재하지 않는 초대 코드입니다.')
      } else {
        setErrorMessage('초대 코드 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    }
  }

  const handleAcceptInvite = async () => {
    if (!inviteInfo?.shortCode && !inviteInfo?.inviteCode) return

    setStatus('accepting')
    const code = inviteInfo.shortCode || inviteInfo.inviteCode

    try {
      await acceptInvite(code)
      await refetchFamily?.()

      setStatus('success')
      clearInviteSession()
      toast.success('가족 초대를 수락했습니다!')

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
        toast.error('이미 가입된 가족 그룹입니다.')
        navigate(ROUTE_PATHS.family, { replace: true })
      } else if (error?.response?.status === 401) {
        toast.warning('로그인이 필요합니다.')
        navigate(ROUTE_PATHS.login)
      } else {
        toast.error('초대 수락에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    }
  }

  const handleGoToLogin = () => {
    navigate(ROUTE_PATHS.login)
  }

  const handleReset = () => {
    setInputCode('')
    setInviteInfo(null)
    setStatus('idle')
    setErrorMessage('')
    clearInviteSession()
  }

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
    }
    if (diffHours > 0) {
      return `${diffHours}시간 ${diffMinutes}분 후 만료`
    }
    return `${diffMinutes}분 후 만료`
  }

  if (status === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h2>가족에 합류했어요!</h2>
            <p>잠시 후 대시보드로 이동합니다...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'validated' && inviteInfo) {
    const role = inviteInfo.suggestedRole || 'SENIOR'
    const expiryText = formatExpiry(inviteInfo.expiresAt)

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>가족 초대</h1>
            <p>아래 정보를 확인하고 가족에 합류해주세요.</p>
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
              <p>예정된 역할</p>
              <span className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}>
                <span className={styles.roleIcon}>{ROLE_ICONS[role]}</span>
                {ROLE_LABELS[role] || role}
              </span>
            </div>

            {expiryText && (
              <p className={styles.expiryWarning}>
                {expiryText === '만료됨' ? '초대가 만료되었습니다.' : `약 ${expiryText}`}
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
                {status === 'accepting' ? '처리 중...' : '초대 수락'}
              </button>
            ) : (
              <>
                <button type="button" className={styles.loginButton} onClick={handleGoToLogin}>
                  로그인하고 수락
                </button>
                <button
                  type="button"
                  className={styles.acceptButton}
                  onClick={() => navigate(ROUTE_PATHS.signup)}
                >
                  회원가입 후 수락
                </button>
              </>
            )}

            <button type="button" className={styles.cancelButton} onClick={handleReset}>
              다시 코드 입력하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>초대 코드 입력</h1>
          <p>가족으로부터 받은 6자리 초대 코드를 입력해주세요.</p>
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
            {status === 'validating' ? <span>확인 중...</span> : <span>코드 확인</span>}
          </button>
        </div>

        <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>
          뒤로 가기
        </button>
      </div>
    </div>
  )
}

export default InviteCodeEntryPage


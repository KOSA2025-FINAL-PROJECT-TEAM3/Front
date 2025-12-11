import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import MemberRoleSelector from './MemberRoleSelector.jsx'
import useKakao from '../../../core/hooks/useKakao.js'
import styles from './InviteMemberForm.module.scss'

export const InviteMemberForm = ({ onSubmit, loading }) => {
  const [inviteResult, setInviteResult] = useState(null)
  const { isInitialized, shareInvite } = useKakao()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      suggestedRole: 'SENIOR',
    },
  })

  const handleInvite = async (formData) => {
    try {
      // API call expects { email, name, ... }. For Open Invite, email might be empty.
      const result = await onSubmit?.({
        ...formData,
        email: formData.email || null, // Convert empty string to null if needed
      })

      // result should contain { inviteUrl, shortCode, ... }
      setInviteResult(result)
      reset({ name: '', email: '', suggestedRole: 'SENIOR' })
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err.message || '초대에 실패했습니다.',
      })
    }
  }

  const handleCopyLink = () => {
    if (!inviteResult?.inviteUrl) return
    navigator.clipboard.writeText(inviteResult.inviteUrl)
      .then(() => alert('초대 링크가 복사되었습니다.'))
      .catch(() => alert('복사에 실패했습니다.'))
  }

  const handleKakaoShare = () => {
    if (!inviteResult?.inviteUrl) return
    shareInvite(inviteResult.inviteUrl, '가족')
  }

  return (
    <div className={styles.container}>
      {/* Invite Result Section */}
      {inviteResult && (
        <div className={styles.resultSection}>
          <h4 className={styles.successTitle}>초대장이 생성되었습니다!</h4>
          
          <div className={styles.linkContainer}>
            <input 
              className={styles.linkInput} 
              value={inviteResult.inviteUrl || ''} 
              readOnly 
            />
            <button type="button" className={styles.actionButton} onClick={handleCopyLink}>
              링크 복사
            </button>
          </div>

          <button type="button" className={styles.kakaoButton} onClick={handleKakaoShare}>
             카카오톡으로 공유하기
          </button>
          
          <p className={styles.hint}>
            수동 입력 코드: <strong>{inviteResult.shortCode}</strong>
          </p>
        </div>
      )}

      {/* Invite Form */}
      <form className={styles.form} onSubmit={handleSubmit(handleInvite)}>
        {errors.root && <p className={styles.error}>{errors.root.message}</p>}

        <label className={styles.label}>
          이름 <span className={styles.optional}>(선택)</span>
          <input
            type="text"
            placeholder="초대할 분의 이름"
            {...register('name', {
              minLength: { value: 2, message: '이름은 최소 2글자 이상이어야 합니다.' },
            })}
            disabled={loading}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </label>

        <label className={styles.label}>
          이메일 <span className={styles.optional}>(선택 - 직접 발송용)</span>
          <input
            type="email"
            placeholder="senior@example.com"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '유효한 이메일을 입력해주세요.',
              },
            })}
            disabled={loading}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          <p className={styles.hint}>이메일을 입력하면 초대장이 메일로도 발송됩니다.</p>
        </label>

        <Controller
          name="suggestedRole"
          control={control}
          render={({ field }) => (
            <div className={styles.roleSection}>
              <span className={styles.label}>역할</span>
              <MemberRoleSelector value={field.value} onChange={field.onChange} disabled={loading} />
            </div>
          )}
        />

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? '초대 중...' : '초대 링크 생성'}
        </button>
      </form>
    </div>
  )
}

InviteMemberForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

InviteMemberForm.defaultProps = {
  loading: false,
}

export default InviteMemberForm
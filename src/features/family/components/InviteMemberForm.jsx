import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import MemberRoleSelector from './MemberRoleSelector.jsx'
import styles from './InviteMemberForm.module.scss'

export const InviteMemberForm = ({ onSubmit, loading }) => {
  const [successMessage, setSuccessMessage] = useState(null)

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
      role: 'SENIOR',
    },
  })

  const handleInvite = async (formData) => {
    try {
      const result = await onSubmit?.(formData)
      // result should contain { shortCode, longToken, expiresAt }
      setSuccessMessage(
        `${formData.name}님에게 초대장을 전송했습니다. 초대 코드: ${result?.shortCode || ''}`
      )
      reset({ name: '', email: '', role: 'SENIOR' })
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err.message || '초대에 실패했습니다.',
      })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleInvite)}>
      {errors.root && (
        <p className={styles.error}>{errors.root.message}</p>
      )}
      {successMessage && (
        <p className={styles.success}>{successMessage}</p>
      )}

      <label className={styles.label}>
        이름
        <input
          type="text"
          placeholder="예: 김시니어"
          {...register('name', {
            required: '이름을 입력해주세요.',
            minLength: { value: 2, message: '이름은 최소 2자 이상이어야 합니다.' },
          })}
          disabled={loading}
        />
        {errors.name && (
          <span className={styles.fieldError}>{errors.name.message}</span>
        )}
      </label>

      <label className={styles.label}>
        이메일 <span className={styles.optional}>(선택)</span>
        <input
          type="email"
          placeholder="senior@example.com"
          {...register('email', {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '유효한 이메일 형식을 입력해주세요.',
            },
          })}
          disabled={loading}
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email.message}</span>
        )}
        <span className={styles.hint}>
          이메일 없이도 초대 코드로 가족을 초대할 수 있습니다.
        </span>
      </label>

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <div className={styles.roleSection}>
            <span className={styles.label}>역할</span>
            <MemberRoleSelector
              value={field.value}
              onChange={field.onChange}
              disabled={loading}
            />
          </div>
        )}
      />

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? '초대 중...' : '초대 보내기'}
      </button>
    </form>
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

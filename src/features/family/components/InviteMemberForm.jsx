import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import MemberRoleSelector from './MemberRoleSelector.jsx'
import styles from './InviteMemberForm.module.scss'

export const InviteMemberForm = ({ onSubmit, loading }) => {
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
      await onSubmit?.({
        ...formData,
        email: formData.email || null, // Convert empty string to null if needed
      })

      // Form reset only on success
      reset({ name: '', email: '', suggestedRole: 'SENIOR' })
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err.message || '초대에 실패했습니다.',
      })
    }
  }

  return (
    <div className={styles.container}>
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
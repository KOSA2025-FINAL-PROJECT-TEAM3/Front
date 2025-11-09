/**
 * Input Component
 * - 텍스트 입력 필드
 * - 에러 상태, 라벨, 힌트 텍스트 지원
 */

import classNames from 'classnames'
import styles from './Input.module.scss'

/**
 * 재사용 가능한 입력 필드 컴포넌트
 * @param {string} type - 입력 타입 (text, email, password, number 등)
 * @param {string} label - 입력 필드 라벨
 * @param {string} placeholder - 입력 필드 플레이스홀더
 * @param {string} value - 입력 필드 값
 * @param {Function} onChange - 입력 변경 핸들러
 * @param {string} error - 에러 메시지
 * @param {string} hint - 힌트 텍스트
 * @param {boolean} required - 필수 필드 표시
 * @param {boolean} disabled - 비활성화 상태
 * @param {string} className - 추가 CSS 클래스
 * @param {Object} props - 추가 HTML 속성
 * @returns {JSX.Element} 입력 필드 컴포넌트
 */
export const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className,
  ...props
}) => {
  const inputClasses = classNames(
    styles.input,
    {
      [styles.error]: error,
      [styles.disabled]: disabled,
    },
    className
  )

  const inputId = props.id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />

      {error && <p className={styles.errorText}>{error}</p>}
      {hint && !error && <p className={styles.hintText}>{hint}</p>}
    </div>
  )
}

export default Input

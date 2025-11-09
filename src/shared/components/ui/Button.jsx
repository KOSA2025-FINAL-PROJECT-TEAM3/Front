/**
 * Button Component
 * - 다양한 변형의 버튼 (primary, secondary, danger 등)
 * - 로딩, 비활성화 상태 지원
 */

import classNames from 'classnames'
import styles from './Button.module.scss'

/**
 * 재사용 가능한 버튼 컴포넌트
 * @param {string} variant - 버튼 스타일 (primary, secondary, danger, ghost)
 * @param {string} size - 버튼 크기 (sm, md, lg)
 * @param {boolean} loading - 로딩 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {string} className - 추가 CSS 클래스
 * @param {React.ReactNode} children - 버튼 내용
 * @param {Function} onClick - 클릭 핸들러
 * @param {string} type - 버튼 타입 (button, submit, reset)
 * @returns {JSX.Element} 버튼 컴포넌트
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.loading]: loading,
      [styles.disabled]: disabled || loading,
    },
    className
  )

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles.spinner}>⏳</span>
          {children && <span className={styles.loadingText}>{children}</span>}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button

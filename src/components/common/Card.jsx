/**
 * Card Component
 * - 콘텐츠를 감싸는 카드 컴포넌트
 * - 제목, 설명, 액션 버튼 등 지원
 */

import classNames from 'classnames'
import styles from './Card.module.css'

/**
 * 카드 컴포넌트
 * @param {React.ReactNode} children - 카드 내용
 * @param {string} className - 추가 CSS 클래스
 * @param {Object} props - 추가 HTML 속성
 * @returns {JSX.Element} 카드 컴포넌트
 */
export const Card = ({ children, className, ...props }) => {
  const cardClasses = classNames(styles.card, className)

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  )
}

/**
 * 카드 헤더 컴포넌트
 * @param {string} title - 제목
 * @param {string} description - 설명
 * @param {React.ReactNode} children - 헤더 내용
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 카드 헤더 컴포넌트
 */
export const CardHeader = ({ title, description, children, className }) => {
  const headerClasses = classNames(styles.header, className)

  return (
    <div className={headerClasses}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  )
}

/**
 * 카드 바디 컴포넌트
 * @param {React.ReactNode} children - 바디 내용
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 카드 바디 컴포넌트
 */
export const CardBody = ({ children, className }) => {
  const bodyClasses = classNames(styles.body, className)

  return <div className={bodyClasses}>{children}</div>
}

/**
 * 카드 푸터 컴포넌트
 * @param {React.ReactNode} children - 푸터 내용
 * @param {string} className - 추가 CSS 클래스
 * @returns {JSX.Element} 카드 푸터 컴포넌트
 */
export const CardFooter = ({ children, className }) => {
  const footerClasses = classNames(styles.footer, className)

  return <div className={footerClasses}>{children}</div>
}

export default Card

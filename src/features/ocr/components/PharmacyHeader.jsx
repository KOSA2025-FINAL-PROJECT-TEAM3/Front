import React from 'react'
import styles from './PharmacyHeader.module.scss'

/**
 * 약국명 헤더 컴포넌트 (이미지 1의 상단 부분)
 *
 * @param {Object} props
 * @param {string} props.pharmacyName - 약국명
 * @param {(name: string) => void} props.onNameChange - 약국명 변경 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 */
const PharmacyHeader = ({ pharmacyName, onNameChange, editable = true }) => {
  return (
    <div className={styles.header}>
      <span className={styles.label}>약 이름표</span>
      <div className={styles.inputWrapper}>
        {editable ? (
          <input
            type="text"
            className={styles.input}
            value={pharmacyName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="약국명을 입력하세요"
          />
        ) : (
          <span className={styles.value}>{pharmacyName || '-'}</span>
        )}
        {editable && <span className={styles.editIcon}>✏️</span>}
      </div>
    </div>
  )
}

export default PharmacyHeader

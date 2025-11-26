import React from 'react'
import styles from './RegistrationInfo.module.scss'

/**
 * 등록 정보 컴포넌트 (이미지 4 하단 참고)
 *
 * @param {Object} props
 * @param {string|null} props.hospitalName - 병원명
 * @param {string} props.pharmacyName - 약국명
 * @param {number|null} props.paymentAmount - 수납 금액
 * @param {(updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {string} [props.createdDate] - 생성일
 */
const RegistrationInfo = ({
  hospitalName,
  pharmacyName,
  paymentAmount,
  onUpdate,
  createdDate
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return ''
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>등록 정보</h3>

      <div className={styles.fields}>
        {/* 병원 정보 */}
        <div className={styles.field}>
          <label>병원 정보</label>
          <input
            type="text"
            className={styles.input}
            value={hospitalName || ''}
            onChange={(e) => onUpdate({ hospitalName: e.target.value || null })}
            placeholder="입력하세요"
          />
        </div>

        {/* 약국명 */}
        <div className={styles.field}>
          <label>약국명</label>
          <input
            type="text"
            className={styles.input}
            value={pharmacyName}
            onChange={(e) => onUpdate({ pharmacyName: e.target.value })}
            placeholder="약국명"
          />
        </div>

        {/* 수납 금액 */}
        <div className={styles.field}>
          <label>수납 금액</label>
          <div className={styles.amountWrapper}>
            <input
              type="number"
              className={styles.input}
              value={paymentAmount || ''}
              onChange={(e) => onUpdate({ paymentAmount: parseInt(e.target.value) || null })}
              placeholder="금액 입력"
            />
            {paymentAmount && (
              <span className={styles.formattedAmount}>
                {formatCurrency(paymentAmount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 생성일 */}
      {createdDate && (
        <div className={styles.createdDate}>
          생성일 {createdDate}
        </div>
      )}
    </div>
  )
}

export default RegistrationInfo

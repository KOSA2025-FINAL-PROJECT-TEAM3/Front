import React from 'react'
import styles from './DurationPicker.module.scss'

/**
 * 복용 기간 선택 컴포넌트 (이미지 2 참고)
 *
 * @param {Object} props
 * @param {string} props.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} props.endDate - 종료일 (YYYY-MM-DD)
 * @param {(updates: { startDate?: string, endDate?: string }) => void} props.onUpdate - 업데이트 핸들러
 */
const DurationPicker = ({ startDate, endDate, onUpdate }) => {
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const currentDay = () => {
    if (!startDate) return 1
    const start = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)

    const diffTime = today - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.min(diffDays + 1, calculateDays()))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.replace(/-/g, '.')
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>
          복용 기간 <span className={styles.duration}>{currentDay()}일차/{calculateDays()}일</span>
        </span>
        <div className={styles.toggleWrapper}>
          <span>종료일</span>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" defaultChecked id="end-date-toggle" />
            <label htmlFor="end-date-toggle" className={styles.slider}></label>
          </div>
        </div>
      </div>

      {/* 날짜 입력 */}
      <div className={styles.dateInputs}>
        <div className={styles.dateField}>
          <label>시작일</label>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
          <span className={styles.dateDisplay}>{formatDate(startDate)}</span>
        </div>

        <div className={styles.dateField}>
          <label>종료일</label>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            min={startDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
          />
          <span className={styles.dateDisplay}>{formatDate(endDate)}</span>
        </div>
      </div>

      {/* 안내 메시지 */}
      <p className={styles.notice}>
        새로 조정된 복용 기간을 확인해 주세요.
      </p>
    </div>
  )
}

export default DurationPicker

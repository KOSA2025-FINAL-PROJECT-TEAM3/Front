/**
 * MedicationCard Component
 * - 약 복용 일정 카드
 */

import styles from './MedicationCard.module.css'

/**
 * 약 복용 카드 컴포넌트
 * @param {Object} schedule - 약 복용 일정
 * @param {number} schedule.id - 카드 ID
 * @param {string} schedule.time - 복용 시간
 * @param {string} schedule.timeLabel - 시간 레이블 (아침, 점심, 저녁)
 * @param {Array} schedule.medications - 약 목록
 * @param {string} schedule.status - 상태 (completed, pending, scheduled)
 * @param {string} schedule.statusLabel - 상태 레이블
 * @param {boolean} schedule.isActive - 활성 여부
 * @returns {JSX.Element} 약 복용 카드
 */
export const MedicationCard = ({ schedule }) => {
  const getStatusColor = () => {
    switch (schedule.status) {
      case 'completed':
        return '#00B300'
      case 'pending':
        return '#FF9900'
      case 'scheduled':
        return '#CCCCCC'
      default:
        return '#999999'
    }
  }

  const handleTakeMedication = () => {
    alert(`${schedule.timeLabel} 약을 복용했습니다!`)
  }

  return (
    <div
      className={`${styles.medicationCard} ${
        schedule.status === 'completed' ? styles.completed : ''
      } ${schedule.isActive ? styles.active : ''}`}
      style={{ borderColor: getStatusColor() }}
    >
      {/* 좌측: 체크박스 */}
      <div className={styles.checkboxArea}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={schedule.status === 'completed'}
          disabled
        />
      </div>

      {/* 중앙: 약 정보 */}
      <div className={styles.medicationInfo}>
        <div className={styles.timeSection}>
          <span className={styles.time}>{schedule.time}</span>
          <span className={styles.timeLabel}>{schedule.timeLabel}</span>
        </div>

        <div className={styles.medicationList}>
          {schedule.medications.map((med, idx) => (
            <div key={idx} className={styles.medicationItem}>
              <span className={styles.medName}>{med.name}</span>
              <span className={styles.medDose}>{med.dose}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 우측: 상태 버튼 */}
      <div className={styles.actionArea}>
        {schedule.status === 'completed' && (
          <div className={styles.statusBadge} style={{ color: getStatusColor() }}>
            {schedule.statusLabel}
          </div>
        )}
        {schedule.status === 'pending' && (
          <button
            className={styles.actionButton}
            onClick={handleTakeMedication}
            style={{ borderColor: getStatusColor(), color: getStatusColor() }}
          >
            {schedule.statusLabel}
          </button>
        )}
        {schedule.status === 'scheduled' && (
          <div className={styles.statusBadge} style={{ color: getStatusColor() }}>
            {schedule.statusLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicationCard

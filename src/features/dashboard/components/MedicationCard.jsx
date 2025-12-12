/**
 * MedicationCard Component
 * - 복용 카드 컴포넌트
 */

import styles from './MedicationCard.module.scss'

/**
 * 복용 카드 컴포넌트
 * @param {Object} schedule - 복용 일정
 * @param {number} schedule.id - 카드 ID
 * @param {number} schedule.medicationId - 약 ID
 * @param {string} schedule.time - 복용 시간
 * @param {string} schedule.timeLabel - 시간 라벨(아침, 점심, 저녁 등)
 * @param {Array} schedule.medications - 약 목록
 * @param {string} schedule.status - 상태 (completed, pending, scheduled)
 * @param {string} schedule.statusLabel - 상태 라벨
 * @param {boolean} schedule.isActive - 활성 여부
 * @param {Function} onTakeMedication - 복용 처리 함수
 * @param {Function} onCardClick - 카드 클릭 함수 (약 상세/수정)
 * @returns {JSX.Element} 복용 카드
 */
export const MedicationCard = ({ schedule, onTakeMedication, onCardClick }) => {
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

  const handleTakeMedication = (e) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (onTakeMedication && schedule.status === 'pending' && schedule.isCompletable) {
      onTakeMedication(schedule)
    }
  }

  const handleCheckboxClick = (e) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (schedule.status === 'pending' && schedule.isCompletable) {
      handleTakeMedication(e)
    }
  }

  const handleCardClick = () => {
    if (onCardClick && schedule.medicationId) {
      onCardClick(schedule.medicationId)
    }
  }

  return (
    <div
      className={`${styles.medicationCard} ${schedule.status === 'completed' ? styles.completed : ''
        } ${schedule.isActive ? styles.active : ''} ${onCardClick ? styles.clickable : ''}`}
      style={{ borderColor: getStatusColor() }}
      onClick={handleCardClick}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
    >
      {/* 좌측: 체크박스 */}
      <div className={styles.checkboxArea}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={schedule.status === 'completed'}
          onChange={handleCheckboxClick}
          disabled={schedule.status !== 'pending' || !schedule.isCompletable}
          style={{ cursor: schedule.status === 'pending' && schedule.isCompletable ? 'pointer' : 'default' }}
        />
      </div>

      {/* 중앙: 정보 */}
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
            disabled={!schedule.isCompletable}
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

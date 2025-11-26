import React from 'react'
import styles from './IntakeTimePicker.module.scss'

/**
 * 복용 시간 선택 컴포넌트 (이미지 2, 4 참고)
 *
 * @param {Object} props
 * @param {IntakeTimeSlot[]} props.intakeTimes - 복용 시간 슬롯
 * @param {(index: number, updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {() => void} props.onAdd - 추가 핸들러
 * @param {(index: number) => void} props.onRemove - 삭제 핸들러
 * @param {boolean} [props.hasAlarmToggle=true] - 알림 토글 표시 여부
 */
const IntakeTimePicker = ({
  intakeTimes,
  onUpdate,
  onAdd,
  onRemove,
  hasAlarmToggle = true
}) => {
  const formatTimeLabel = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours < 12 ? '오전' : '오후'
    const displayHours = hours % 12 || 12
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>
          하루 복용 횟수 <span className={styles.count}>{intakeTimes.length}회</span>
        </span>
        {hasAlarmToggle && (
          <div className={styles.alarmToggle}>
            <span>알림</span>
            <div className={styles.toggleSwitch}>
              <input type="checkbox" defaultChecked id="global-alarm" />
              <label htmlFor="global-alarm" className={styles.slider}></label>
            </div>
          </div>
        )}
      </div>

      {/* 시간 슬롯 리스트 */}
      <div className={styles.timeList}>
        {intakeTimes.map((slot, index) => (
          <div key={slot.index} className={styles.timeSlot}>
            <span className={styles.slotNumber}>{index + 1}회</span>

            <div className={styles.timeInputWrapper}>
              <input
                type="time"
                className={styles.timeInput}
                value={slot.time}
                onChange={(e) => onUpdate(index, {
                  time: e.target.value,
                  label: formatTimeLabel(e.target.value)
                })}
              />
              <span className={styles.timeLabel}>{slot.label}</span>
            </div>

            {/* 삭제 버튼 */}
            {intakeTimes.length > 1 && (
              <button
                className={styles.removeBtn}
                onClick={() => onRemove(index)}
                aria-label="시간 삭제"
              >
                ✕
              </button>
            )}

            {/* 알림 아이콘 */}
            {hasAlarmToggle && (
              <button
                className={`${styles.alarmBtn} ${slot.hasAlarm ? styles.active : ''}`}
                onClick={() => onUpdate(index, { hasAlarm: !slot.hasAlarm })}
                aria-label={slot.hasAlarm ? '알림 끄기' : '알림 켜기'}
              >
                🔔
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 복용 횟수 추가 버튼 */}
      <button
        className={styles.addBtn}
        onClick={onAdd}
        disabled={intakeTimes.length >= 10}
      >
        복용 횟수 추가
      </button>
    </div>
  )
}

export default IntakeTimePicker

import styles from './MedicationCard.module.scss'

export const MedicationCard = ({ medication, onToggle, onRemove, onSelect }) => {
  const handleSelect = () => {
    onSelect?.(medication)
  }

  const handleToggle = (event) => {
    event.stopPropagation()
    onToggle?.(medication.id)
  }

  const handleRemove = (event) => {
    event.stopPropagation()
    onRemove?.(medication.id)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.body}>
        <p className={styles.name}>{medication.name}</p>
        <p className={styles.detail}>
          {medication.dosage} · {medication.schedule || '스케줄 없음'}
        </p>
        {medication.instructions && (
          <p className={styles.instructions}>{medication.instructions}</p>
        )}
      </div>
      <div className={styles.actions}>
        <span className={`${styles.statusBadge} ${medication.active ? styles.active : styles.paused}`}>
          {medication.active ? '복용 중' : '일시중지'}
        </span>
        <div className={styles.actionButtons}>
          <button type="button" onClick={handleToggle}>
            {medication.active ? '일시중지' : '복용 재개'}
          </button>
          <button type="button" onClick={handleRemove}>
            삭제
          </button>
        </div>
      </div>
    </article>
  )
}

export default MedicationCard

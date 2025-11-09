import styles from './MedicationCard.module.scss'

const statusLabel = {
  ACTIVE: '복용 중',
  PAUSED: '일시중지',
}

export const MedicationCard = ({ medication, onToggle, onRemove }) => {
  return (
    <article className={styles.card}>
      <div>
        <p className={styles.name}>{medication.name}</p>
        <p className={styles.detail}>{medication.dosage} · {medication.schedule}</p>
        {medication.instructions && (
          <p className={styles.instructions}>{medication.instructions}</p>
        )}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => onToggle?.(medication.id)}>
          {statusLabel[medication.status] || '상태전환'}
        </button>
        <button type="button" onClick={() => onRemove?.(medication.id)}>
          삭제
        </button>
      </div>
    </article>
  )
}

export default MedicationCard

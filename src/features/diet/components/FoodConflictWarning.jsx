import styles from './FoodConflictWarning.module.scss'

const severityLabel = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

export const FoodConflictWarning = ({ conflict }) => {
  if (!conflict) return null
  const { food, medication, severity, reason } = conflict

  return (
    <section className={styles.warningCard}>
      <div className={styles.alert}>
        <span className={styles.alertIcon}>⚠️</span>
        <div>
          <p className={styles.alertTitle}>주의! 음식-약물 상호작용</p>
          <span className={styles.severity} data-level={severity}>
            {severityLabel[severity] || severity}
          </span>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.block}>
          <p className={styles.blockLabel}>음식 정보</p>
          <p className={styles.blockTitle}>{food.name}</p>
          <p className={styles.blockDesc}>{food.description}</p>
        </div>
        <div className={styles.block}>
          <p className={styles.blockLabel}>약 정보</p>
          <p className={styles.blockTitle}>{medication.name}</p>
          <p className={styles.blockDesc}>
            {medication.dosage} · {medication.schedule}
          </p>
        </div>
      </div>

      <div className={styles.reason}>
        <p>{reason}</p>
      </div>
    </section>
  )
}

export default FoodConflictWarning

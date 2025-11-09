import styles from './FamilyMedicationList.module.scss'

export const FamilyMedicationList = ({ medications = [] }) => {
  if (!medications.length) {
    return (
      <section className={styles.empty}>
        <p>등록된 복약 일정이 없습니다. Stage 4에서 실제 데이터가 연동됩니다.</p>
      </section>
    )
  }

  return (
    <section className={styles.list}>
      <h3>복약 일정</h3>
      {medications.map((item) => (
        <div key={`${item.time}-${item.name}`} className={styles.card}>
          <div>
            <p className={styles.time}>{item.timeLabel}</p>
            <h4>{item.name}</h4>
          </div>
          <span className={styles.status}>{item.statusLabel}</span>
        </div>
      ))}
    </section>
  )
}

export default FamilyMedicationList

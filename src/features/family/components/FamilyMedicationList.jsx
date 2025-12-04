import styles from './FamilyMedicationList.module.scss'

export const FamilyMedicationList = ({ medications = [] }) => {
  if (!medications.length) {
    return (
      <section className={styles.empty}>
        <p>등록된 약이 없습니다.</p>
      </section>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const getStatusLabel = (active) => {
    return active ? '복용 중' : '복용 종료'
  }

  const getStatusColor = (active) => {
    return active ? '#00B300' : '#999999'
  }

  return (
    <section className={styles.list}>
      <h3>약 목록</h3>
      {medications.map((med) => (
        <div key={med.id} className={styles.card}>
          <div className={styles.medInfo}>
            <h4>{med.name}</h4>
            {med.ingredient && <p className={styles.ingredient}>{med.ingredient}</p>}
            {med.dosage && <p className={styles.dosage}>{med.dosage}</p>}
            {(med.startDate || med.endDate) && (
              <p className={styles.period}>
                {formatDate(med.startDate)} ~ {formatDate(med.endDate)}
              </p>
            )}
          </div>
          <div className={styles.statusSection}>
            <span
              className={styles.status}
              style={{ color: getStatusColor(med.active) }}
            >
              {getStatusLabel(med.active)}
            </span>
            {med.schedules && med.schedules.length > 0 && (
              <span className={styles.scheduleCount}>
                {med.schedules.length}회 복용
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}

export default FamilyMedicationList

import MedicationCard from './MedicationCard.jsx'
import styles from './MedicationList.module.scss'

export const MedicationList = ({ medications = [], onToggle, onRemove }) => {
  if (!medications.length) {
    return (
      <div className={styles.empty}>
        <p>등록된 약이 없습니다. 약 등록 폼을 사용해 추가하세요.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {medications.map((med) => (
        <MedicationCard
          key={med.id}
          medication={med}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default MedicationList

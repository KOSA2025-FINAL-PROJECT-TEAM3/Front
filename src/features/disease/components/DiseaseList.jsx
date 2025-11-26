import DiseaseCard from './DiseaseCard'
import styles from './DiseaseList.module.scss'

export const DiseaseList = ({ diseases = [], loading, onSelect, onDelete, onEdit }) => {
  if (loading) {
    return <div className={styles.hint}>질병 목록을 불러오는 중입니다...</div>
  }

  if (!diseases.length) {
    return <div className={styles.empty}>등록된 질병이 없습니다.</div>
  }

  return (
    <div className={styles.list}>
      {diseases.map((disease) => (
        <DiseaseCard
          key={disease.id}
          disease={disease}
          onSelect={onSelect}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default DiseaseList

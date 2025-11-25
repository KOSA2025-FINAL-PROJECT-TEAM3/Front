import React from 'react'
import MedicationCard from './MedicationCard'
import styles from './MedicationCardList.module.scss'

/**
 * 약물 카드 리스트 컴포넌트 (이미지 1, 3 참고)
 *
 * @param {Object} props
 * @param {EditableMedication[]} props.medications - 약물 목록
 * @param {(id: string, updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {(id: string) => void} props.onRemove - 삭제 핸들러
 * @param {() => void} props.onAdd - 추가 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 */
const MedicationCardList = ({
  medications,
  onUpdate,
  onRemove,
  onAdd,
  editable = true
}) => {
  if (!medications || medications.length === 0) {
    return (
      <div className={styles.empty}>
        <p>인식된 약 정보가 없습니다.</p>
        {editable && (
          <button className={styles.addBtn} onClick={onAdd}>
            + 약 추가
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>
          처방약 <span className={styles.count}>{medications.length}개</span>
        </span>
        <div className={styles.labels}>
          <span>복용량</span>
          <span>횟수</span>
          <span>일수</span>
        </div>
      </div>

      {/* 약물 카드 리스트 */}
      <div className={styles.list}>
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onUpdate={onUpdate}
            onRemove={onRemove}
            editable={editable}
          />
        ))}
      </div>

      {/* 약 추가 버튼 */}
      {editable && (
        <button className={styles.addBtn} onClick={onAdd}>
          + 약 추가
        </button>
      )}
    </div>
  )
}

export default MedicationCardList

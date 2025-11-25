import React from 'react'
import styles from './MedicationCard.module.scss'

/**
 * 개별 약물 카드 컴포넌트 (이미지 1, 3 참고)
 *
 * @param {Object} props
 * @param {EditableMedication} props.medication - 약물 정보
 * @param {(id: string, updates: Partial<EditableMedication>) => void} props.onUpdate - 업데이트 핸들러
 * @param {(id: string) => void} props.onRemove - 삭제 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 * @param {boolean} [props.showDetail=false] - 상세 정보 표시 여부
 */
const MedicationCard = ({
  medication,
  onUpdate,
  onRemove,
  editable = true,
  showDetail = false
}) => {
  const handleChange = (field, value) => {
    onUpdate(medication.id, { [field]: value })
  }

  return (
    <div className={styles.card}>
      {/* 약 이미지 + 이름 + 분류 */}
      <div className={styles.header}>
        <div className={styles.imageWrapper}>
          {medication.imageUrl ? (
            <img src={medication.imageUrl} alt={medication.name} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>💊</div>
          )}
        </div>

        <div className={styles.info}>
          {editable ? (
            <>
              <input
                type="text"
                className={styles.nameInput}
                value={medication.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="약 이름"
              />
              <input
                type="text"
                className={styles.categoryInput}
                value={medication.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="분류 (예: 제산제)"
              />
            </>
          ) : (
            <>
              <span className={styles.name}>{medication.name}</span>
              {medication.category && (
                <span className={styles.category}>{medication.category}</span>
              )}
            </>
          )}
        </div>

        {editable && (
          <button
            className={styles.detailBtn}
            onClick={() => {/* 상세 페이지 이동 또는 모달 */}}
          >
            &gt;
          </button>
        )}
      </div>

      {/* 복용량 | 횟수 | 일수 */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          {editable ? (
            <input
              type="number"
              min="1"
              value={medication.dosageAmount}
              onChange={(e) => handleChange('dosageAmount', parseInt(e.target.value) || 1)}
              className={styles.statInput}
            />
          ) : (
            <span className={styles.statValue}>{medication.dosageAmount}</span>
          )}
          <span className={styles.statLabel}>정씩</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.stat}>
          <span className={styles.statLabel}>하루</span>
          {editable ? (
            <input
              type="number"
              min="1"
              max="10"
              value={medication.dailyFrequency}
              onChange={(e) => handleChange('dailyFrequency', parseInt(e.target.value) || 1)}
              className={styles.statInput}
            />
          ) : (
            <span className={styles.statValue}>{medication.dailyFrequency}</span>
          )}
          <span className={styles.statLabel}>회</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.stat}>
          {editable ? (
            <input
              type="number"
              min="1"
              value={medication.durationDays}
              onChange={(e) => handleChange('durationDays', parseInt(e.target.value) || 1)}
              className={styles.statInput}
            />
          ) : (
            <span className={styles.statValue}>{medication.durationDays}</span>
          )}
          <span className={styles.statLabel}>일분</span>
        </div>
      </div>

      {/* 삭제 버튼 (편집 모드) */}
      {editable && (
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(medication.id)}
        >
          삭제
        </button>
      )}
    </div>
  )
}

export default MedicationCard

/**
 * FamilyMemberCard Component
 * - 가족 구성원의 복약 현황 카드
 */

import styles from './FamilyMemberCard.module.scss'

/**
 * @param {Object} member
 * @param {string|number} member.id
 * @param {string} member.name
 * @param {string} member.relation
 * @param {number} member.age
 * @param {{scheduled:number,completed:number,missed:number}} member.todayStatus
 * @param {string} member.lastMedicationTime
 * @param {string} member.nextMedicationTime
 * @param {(id:string|number)=>void} onDetail
 */
export const FamilyMemberCard = ({ member, onDetail }) => {
  if (!member) return null
  const { scheduled = 0, completed = 0, missed = 0 } = member.todayStatus || {}
  const complianceRate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0

  return (
    <div className={styles.memberCard}>
      {/* 헤더: 이름 · 기본정보 */}
      <div className={styles.cardHeader}>
        <div className={styles.memberInfo}>
          <h3 className={styles.memberName}>{member.name}</h3>
          <div className={styles.memberMeta}>
            <span className={styles.relation}>{member.relation}</span>
            <span className={styles.age}>{member.age}세</span>
          </div>
        </div>

        {/* 준수율 뱃지 */}
        <div
          className={styles.complianceBadge}
          style={{
            background:
              complianceRate === 100
                ? '#00b300'
                : complianceRate >= 50
                ? '#ff9900'
                : '#ff6b6b',
          }}
        >
          <span className={styles.complianceValue}>{complianceRate}%</span>
          <span className={styles.complianceLabel}>준수율</span>
        </div>
      </div>

      {/* 상태 통계 */}
      <div className={styles.statusStats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{scheduled}</span>
          <span className={styles.statName}>예정</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statNumber} style={{ color: '#00b300' }}>
            {completed}
          </span>
          <span className={styles.statName}>완료</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statNumber} style={{ color: '#ff6b6b' }}>
            {missed}
          </span>
          <span className={styles.statName}>미복용</span>
        </div>
      </div>

      {/* 복용 시간 정보 */}
      <div className={styles.medicationTimeline}>
        <div className={styles.timeItem}>
          <span className={styles.timeLabel}>마지막 복용</span>
          <span className={styles.timeValue}>{member.lastMedicationTime}</span>
        </div>
        <div className={styles.timeItem}>
          <span className={styles.timeLabel}>다음 복용</span>
          <span className={styles.timeValue}>{member.nextMedicationTime}</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <button
        type="button"
        className={styles.detailButton}
        onClick={() => onDetail?.(member.id)}
      >
        상세 보기
      </button>
    </div>
  )
}

export default FamilyMemberCard

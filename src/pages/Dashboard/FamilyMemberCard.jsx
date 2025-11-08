/**
 * FamilyMemberCard Component
 * - 가족 구성원의 약 복용 현황 카드
 */

import styles from './FamilyMemberCard.module.css'

/**
 * 가족 구성원 카드 컴포넌트
 * @param {Object} member - 가족 구성원 정보
 * @param {number} member.id - 구성원 ID
 * @param {string} member.name - 이름
 * @param {string} member.relation - 관계
 * @param {number} member.age - 나이
 * @param {Object} member.todayStatus - 오늘 상태
 * @param {string} member.lastMedicationTime - 마지막 복용 시간
 * @param {string} member.nextMedicationTime - 다음 복용 시간
 * @returns {JSX.Element} 가족 구성원 카드
 */
export const FamilyMemberCard = ({ member }) => {
  const getComplianceRate = () => {
    const { scheduled, completed } = member.todayStatus
    return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
  }

  const complianceRate = getComplianceRate()

  return (
    <div className={styles.memberCard}>
      {/* 헤더: 이름 및 상태 */}
      <div className={styles.cardHeader}>
        <div className={styles.memberInfo}>
          <h3 className={styles.memberName}>{member.name}</h3>
          <div className={styles.memberMeta}>
            <span className={styles.relation}>{member.relation}</span>
            <span className={styles.age}>{member.age}세</span>
          </div>
        </div>

        {/* 순응도 배지 */}
        <div className={styles.complianceBadge} style={{
          background: complianceRate === 100 ? '#00b300' : complianceRate >= 50 ? '#ff9900' : '#ff6b6b'
        }}>
          <span className={styles.complianceValue}>{complianceRate}%</span>
          <span className={styles.complianceLabel}>순응도</span>
        </div>
      </div>

      {/* 상태 통계 */}
      <div className={styles.statusStats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{member.todayStatus.scheduled}</span>
          <span className={styles.statName}>예정</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statNumber} style={{ color: '#00b300' }}>
            {member.todayStatus.completed}
          </span>
          <span className={styles.statName}>완료</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statNumber} style={{ color: '#ff6b6b' }}>
            {member.todayStatus.missed}
          </span>
          <span className={styles.statName}>미흡</span>
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
      <button className={styles.detailButton}>
        상세 보기
      </button>
    </div>
  )
}

export default FamilyMemberCard

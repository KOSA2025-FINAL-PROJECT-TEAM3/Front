import FamilyMemberCard from './FamilyMemberCard'
import styles from './FamilyMemberList.module.scss'

export const FamilyMemberList = ({
  members = [],
  onDetail,
  onRemove,
  onlineMemberIds = [],
  removingMemberId,
}) => {
  if (!members.length) {
    return (
      <section className={styles.emptyState} aria-live="polite">
        <p>아직 등록된 가족 구성원이 없습니다.</p>
        <p>상단의 초대 버튼을 눌러 가족을 초대해보세요.</p>
      </section>
    )
  }

  return (
    <section className={styles.listSection}>
      <h3>가족 구성원</h3>
      <div className={styles.list}>
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onDetail={onDetail}
            onRemove={onRemove}
            isOnline={onlineMemberIds.includes(member.id)}
            isRemoving={removingMemberId === member.id}
          />
        ))}
      </div>
    </section>
  )
}

export default FamilyMemberList

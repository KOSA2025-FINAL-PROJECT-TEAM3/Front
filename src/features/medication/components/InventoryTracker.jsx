import styles from './InventoryTracker.module.scss'

const formatDisplayDate = (isoString) => {
  if (!isoString) return '기록 없음'
  try {
    return new Date(isoString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export const InventoryTracker = ({ medications = [] }) => {
  const total = medications.length
  const active = medications.filter((med) => med.status === 'ACTIVE').length
  const paused = total - active

  const lastUpdatedMed = medications.reduce(
    (latest, med) => {
      const candidate = med.updatedAt || med.createdAt
      if (!candidate) return latest
      if (!latest.value || new Date(candidate) > new Date(latest.value)) {
        return { value: candidate, name: med.name }
      }
      return latest
    },
    { value: null, name: null },
  )

  return (
    <section className={styles.tracker}>
      <div className={styles.statCard}>
        <p className={styles.label}>등록된 약</p>
        <p className={styles.primaryValue}>{total}</p>
        <p className={styles.caption}>총 관리 대상</p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.label}>복용 중</p>
        <p className={styles.primaryValue}>{active}</p>
        <p className={styles.caption}>일시중지 {paused}건</p>
      </div>
      <div className={styles.statCardWide}>
        <p className={styles.label}>최근 업데이트</p>
        <p className={styles.meta}>
          {lastUpdatedMed.name ? (
            <>
              <strong>{lastUpdatedMed.name}</strong> ·{' '}
              {formatDisplayDate(lastUpdatedMed.value)}
            </>
          ) : (
            '기록 없음'
          )}
        </p>
      </div>
    </section>
  )
}

export default InventoryTracker

import styles from './FamilyAdherenceChart.module.scss'

export const FamilyAdherenceChart = ({ adherence = 0 }) => {
  const percent = Math.min(Math.max(adherence, 0), 100)
  return (
    <section className={styles.chart}>
      <h3>복약 순응도</h3>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
      <p className={styles.caption}>{percent}% / 7일 기준</p>
    </section>
  )
}

export default FamilyAdherenceChart

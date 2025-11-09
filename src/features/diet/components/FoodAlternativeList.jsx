import styles from './FoodAlternativeList.module.scss'

export const FoodAlternativeList = ({ items = [] }) => {
  if (!items.length) return null

  return (
    <section className={styles.alternativeSection}>
      <h3>대체 음식 제안</h3>
      <div className={styles.list}>
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.icon}>🥗</div>
            <div>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.benefit}>{item.benefits}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FoodAlternativeList

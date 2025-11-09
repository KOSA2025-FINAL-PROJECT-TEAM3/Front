import styles from './SettingsMenu.module.scss'

export const SettingsMenu = ({ items = [] }) => {
  return (
    <section className={styles.menuSection}>
      <ul className={styles.menuList}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={item.onClick}
            >
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.labelGroup}>
                <span className={styles.label}>{item.label}</span>
                {item.description && (
                  <span className={styles.description}>{item.description}</span>
                )}
              </div>
              <span className={styles.chevron}>›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default SettingsMenu

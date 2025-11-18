/**
 * MenuGroup Component
 * - 그룹화된 메뉴 리스트 표시
 */

import styles from './MenuGroup.module.scss'

export const MenuGroup = ({ title, items = [] }) => {
  return (
    <section className={styles.menuGroup}>
      {title && <h2 className={styles.groupTitle}>{title}</h2>}
      <ul className={styles.menuList}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.labelGroup}>
                <span className={styles.label}>{item.label}</span>
                {item.description && (
                  <span className={styles.description}>{item.description}</span>
                )}
              </div>
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
              <span className={styles.chevron}>›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default MenuGroup

/**
 * Tabs Component
 * @component Tabs
 */

import { useState } from 'react'
import styles from './Tabs.module.scss'

/**
 * Tabs component for tabbed navigation
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects {id, label, content}
 * @param {string} props.defaultTab - Default active tab ID
 * @returns {JSX.Element}
 */
export const Tabs = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{activeTabContent}</div>
    </div>
  )
}

export default Tabs

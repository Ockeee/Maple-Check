import styles from '@/styles/Tab.module.css';

type TabItem = {
  key: string
  label: string
}

type Props = {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
}

export default function Tab({ tabs, active, onChange }: Props) {
  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${active === tab.key ? styles.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
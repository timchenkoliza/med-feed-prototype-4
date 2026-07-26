import { Icon, type IconName } from '../common/Icon'
import type { IosTab } from './IosShell'
import styles from './MobileTabBar.module.css'

interface Props {
  active: IosTab
  onChange: (t: IosTab) => void
}

const tabs: Array<{ id: IosTab; label: string; icon: IconName }> = [
  { id: 'feed', label: 'Лента', icon: 'feed' },
  { id: 'chat', label: 'AI-чат', icon: 'chat' },
  { id: 'saved', label: 'Сохранённое', icon: 'bookmark' },
  { id: 'profile', label: 'Профиль', icon: 'user' },
]

export function MobileTabBar({ active, onChange }: Props) {
  return (
    <nav className={styles.bar} aria-label="Нижняя навигация">
      {tabs.map(t => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(t.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={isActive && t.icon === 'bookmark' ? 'bookmark-filled' : t.icon} size={22} strokeWidth={1.7} />
            <span className={styles.label}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

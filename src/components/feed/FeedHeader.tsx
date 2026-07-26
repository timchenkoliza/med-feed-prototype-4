import userData from '../../data/user.json'
import type { UserProfile } from '../../types'
import { Icon } from '../common/Icon'
import styles from './FeedHeader.module.css'

interface Props {
  onOpenSearch: () => void
  onOpenSaved: () => void
}

const user = userData as UserProfile

export function FeedHeader({ onOpenSearch, onOpenSaved }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>Для вас</h1>
        <p className={styles.subtitle}>Главное по вашей специальности из проверенных источников</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} aria-label="Поиск по ленте" onClick={onOpenSearch}>
          <Icon name="search" size={20} />
        </button>
        <button type="button" className={styles.savedBtn} onClick={onOpenSaved}>
          <Icon name="bookmark" size={18} strokeWidth={1.6} />
          <span>Сохранённое</span>
        </button>
        <div className={styles.avatar} aria-label={`Аватар пользователя ${user.name}`}>
          {user.avatarInitials}
        </div>
      </div>
    </header>
  )
}

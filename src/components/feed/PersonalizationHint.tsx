import userData from '../../data/user.json'
import type { UserProfile } from '../../types'
import styles from './PersonalizationHint.module.css'

const user = userData as UserProfile

export function PersonalizationHint({ onEdit }: { onEdit?: () => void }) {
  return (
    <div className={styles.hint}>
      <div className={styles.text}>
        <span className={styles.title}>Лента настроена для {user.specialty}а</span>
        <button type="button" className={styles.link} onClick={onEdit}>
          Изменить специальность и интересы
        </button>
      </div>
    </div>
  )
}

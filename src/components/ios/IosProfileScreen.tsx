import userData from '../../data/user.json'
import type { UserProfile } from '../../types'
import styles from './IosStubs.module.css'

const user = userData as UserProfile

export function IosProfileScreen() {
  return (
    <div className={styles.profileWrap}>
      <div className={styles.profileHead}>
        <div className={styles.profileAvatar}>{user.avatarInitials}</div>
        <div>
          <div className={styles.profileName}>{user.name}</div>
          <div className={styles.profileRole}>{user.role} · {user.specialty}</div>
        </div>
      </div>

      <section>
        <div className={styles.sectionLabel}>Интересы</div>
        <div className={styles.chips}>
          {user.interests.map((t, i) => <span key={i} className={styles.chip}>{t}</span>)}
        </div>
      </section>

      <section>
        <div className={styles.sectionLabel}>Настройки</div>
        <ul className={styles.settings}>
          <li>Специальность и интересы</li>
          <li>Уведомления</li>
          <li>Источники</li>
          <li>Пользовательское соглашение</li>
          <li>Политика конфиденциальности</li>
        </ul>
      </section>
    </div>
  )
}

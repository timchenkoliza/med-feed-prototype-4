import { NavLink } from 'react-router-dom'
import styles from './DevicePreviewSwitcher.module.css'

export function DevicePreviewSwitcher() {
  return (
    <div className={styles.wrap} aria-label="Переключатель режима демонстрации">
      <span className={styles.label}>Прототип</span>
      <NavLink
        to="/web"
        className={({ isActive }) => `${styles.btn} ${isActive ? styles.active : ''}`}
      >
        Desktop Web
      </NavLink>
      <NavLink
        to="/ios"
        className={({ isActive }) => `${styles.btn} ${isActive ? styles.active : ''}`}
      >
        iPhone 15 Pro Max
      </NavLink>
    </div>
  )
}
